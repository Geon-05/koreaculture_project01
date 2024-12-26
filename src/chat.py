import pandas as pd
import json
import google.generativeai as genai
from numpy import dot
import numpy as np
from numpy.linalg import norm
import os
import re
import ast
import math
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter
import math

try:
    base_path = 'data/'
    base_file_path = os.path.join(base_path, "2020_2023data.csv")
    code_file_path = os.path.join(base_path, "code_book.xlsx")
    base_df = pd.read_csv(base_file_path)
    code_df = pd.read_excel(code_file_path)
    id_df = base_df.iloc[:,0:1]
    user_culture_df = base_df.iloc[:,1:92]
    user_culture_df = pd.concat([id_df,user_culture_df], axis=1)
    user_ranking_df = base_df.iloc[:,92:97]
    user_ranking_df = pd.concat([id_df,user_ranking_df], axis=1)
    user_cost_df = base_df.iloc[:,97:102]
    user_cost_df = pd.concat([id_df,user_cost_df], axis=1)
    user_area_df = base_df.iloc[:,102:103]
    user_area_df = pd.concat([id_df,user_area_df], axis=1)
    code_service_df = code_df.iloc[0:3,:]
    service_code_val_dict = code_service_df.set_index(code_service_df.columns[0])[code_service_df.columns[1]].to_dict()
    code_culture_df = code_df.iloc[3:95,:]
    culture_code_val_dict_non = code_culture_df.set_index(code_culture_df.columns[0])[code_culture_df.columns[1]].to_dict()
    culture_code_val_dict = {key: value for key, value in culture_code_val_dict_non.items() if key != 'Q1_99'}
    code_area_df = code_df.iloc[95:112,:]
    area_code_val_dict = code_area_df.set_index(code_area_df.columns[0])[code_area_df.columns[1]].to_dict()
except FileNotFoundError:
    print('파일을 찾을 수 없습니다.')
except Exception as e:
    print(f'예외가 발생했습니다: {str(e)}')

api_key_path = 'important/APIkey.json'
api_key_path2 = 'key/APIkey.json'

# API 키 및 모델 설정
def load_api_key():
    try:
        with open(api_key_path, 'r') as file:
            data = json.load(file)
            print("API 키 로딩이 완료되었습니다.")
            return data.get('Gemini')
    except FileNotFoundError:
        print("API 키 파일을 찾을 수 없습니다.")
        try:
            with open(api_key_path2, 'r') as file:
                data = json.load(file)
                print("임시 API 키 로딩이 완료되었습니다.")
                return data.get('Gemini')
        except FileNotFoundError:
            print("API 키 파일을 찾을 수 없습니다.")
            return None
        except json.JSONDecodeError:
            print("API 키 파일의 JSON 형식이 올바르지 않습니다.")
            return None
        return None
    except json.JSONDecodeError:
        print("API 키 파일의 JSON 형식이 올바르지 않습니다.")
        return None
    
# 모델 생성부 -----------------------------------------
api_key = load_api_key()
if api_key:
    # Gemini 모델 생성
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        print("Gemini 로딩이 완료되었습니다.")
    except Exception as e:
        print(f"Gemini 모델 생성 오류: {e}")

def intention(message):
    # 사용자가 입력한 문장
    prompt = f'''너는 자연어처리를 이용해서 코드를 반환하는 챗봇이야 아래는 사용자의 질문과 코드 딕셔너리이고
    다음 사용자 질문에 비슷한 코드를 찾아서 하나의 코드 키 값만 반환해줘
    사용자의 질문의도가 우리 서비스에서 제공되지않으면 반드시 'se_co01'코드를 반환해줘

    사용자:
    {message}
    
    코드 딕셔너리:
    {service_code_val_dict}
    '''
    
    prompt = prompt.replace("\n", "").replace("\\","")
    response = model.generate_content(prompt)
    answer = response.candidates[0].content.parts[0].text
    
    answer = answer.strip()
    answer = answer.replace("'","")
    
    print(f'사용자 요청 서비스 : {answer}')
    
    if answer == 'se_co01':
        # 사용자의 이용목적을 모르는 경우
        return gemini_answer(message)
    elif answer == 'se_co02':
        # 비슷한 여가생활을 질문하는 경우
        return subject_chk(message)
    elif answer == 'se_co03':
        # 여가생활을 즐기는데 비용을 질문하는 경우
        return cost_chk(message)
    else:
        return '알수없는 코드입니다.'

def gemini_answer(message):
    answer = ''
    answer += '지금 질문하신 내용은 현재 서비스되지않는 질문입니다. 아래와 같이 다시 질문해보세요.<br>'
    answer += '1. 나는 ~를 좋아해 나와 비슷한 사람들은 어떤 여가생활을 하는지 찾아줘<br>'
    answer += '2. 나는 ~를 좋아해 내가 즐겨하는 여가생활의 평균 비용을 알고싶어<br>'
    answer += '<br>'
    answer += '🔍 Gemini 서비스<br>'
    response = model.generate_content(message)
    answer += response.candidates[0].content.parts[0].text
    return answer
    
def cosine(message):
    '''
    사용자의 message(채팅)을 입력받아 사용자와 비슷한 유형의 사람 상위 5명을 추출((doc_id, sim))하는 함수
    '''
    # 사용자가 입력한 문장
    prompt = f'''너는 자연어처리를 이용해서 코드를 반환하는 챗봇이야. 
    아래는 키워드와 코드 딕셔너리이고, 다음 사용자 질문에 비슷한 코드를 찾아서 "code"에는 값은 필요없고 코드만 리스트로 
    다음 JSON 형식으로만 응답해줘. 다른 텍스트는 포함하지 마.

    "keyword": "키워드",
    "code": "코드"

    사용자:
    {message}

    코드:
    {culture_code_val_dict}
    '''

    prompt = prompt.replace("\n", "")
    cleaned_prompt = re.sub(r"\\", "", prompt)
    response = model.generate_content(cleaned_prompt)
    answer = response.candidates[0].content.parts[0].text

    try:
        # JSON 데이터만 추출
        answer = answer.replace("`json\n", "").replace("\n", "")
        answer = answer.replace("\\","")
        answer = answer.replace("`", "")

        # JSON 형식으로 파싱
        json_data = json.loads(answer)
        if type(json_data['code']) == str:
            list_data = [json_data['code']]
        list_data = json_data['code']   
    except json.JSONDecodeError as e:
        # 파싱 오류 처리
        print(f"JSON 파싱 오류: {e}")
        return 'json error'
    
    
    
    if len(list_data) == 91 or len(list_data) == 0:
        return 'data error'
    
    data = {key: (1 if key in list_data else 0) for key in culture_code_val_dict.keys()}
    data_df = pd.DataFrame([data])
    
    # 코사인 유사도 함수 정의
    def cos_sim(A, B):
        return dot(A, B) / (norm(A) * norm(B))

    # 데이터 로드
    data_vectors = user_culture_df.select_dtypes(include=[np.number]).iloc[:,1:].values  # 숫자형 데이터만 사용
    data_ids = user_culture_df['ID'][:].values

    # 입력 벡터와 각 데이터 벡터 간의 유사도를 계산하여 리스트에 저장
    similarities = []
    for i in range(len(data_vectors)):
        similarity = cos_sim(data_df, data_vectors[i])
        similarities.append((data_ids[i], similarity))  # (ID, 유사도) 형태로 저장

    # 유사도에 따라 내림차순 정렬
    similarities.sort(key=lambda x: x[1], reverse=True)

    # 상위 N개의 유사한 문서 추출 (예: 상위 5개)
    top_n = 5
    return similarities[:top_n]

def subject_chk(message):
    for i in range(11):
        if i == 10:
            return '서버에서 요청에 응답하지 못했습니다. 질문을 바꿔주세요.'
        top_n_similarities = cosine(message)
        print(f'subject_chk {i +1}회 시도 에러내용 : {top_n_similarities}')
        if 'error' in top_n_similarities:
            continue
        else:
            break

    user_culture = {}

    # 출력
    for doc_id, sim in top_n_similarities:
        user_culture[doc_id] = []
        row_index = 0  # 원하는 행의 인덱스 설정

        # 값이 1인 열 이름 추출
        columns_with_ones = user_culture_df.columns[user_culture_df[user_culture_df['ID'] == doc_id].iloc[row_index] == 1].tolist()

        for column in columns_with_ones:
            try:
                # code_val_dic에서 column 키가 존재하는 경우에만 추가
                user_culture[doc_id].append(culture_code_val_dict[column])
            except KeyError:
                # code_val_dic에 키가 없는 경우 예외 처리
                print(f"Warning: {column} 키가 code_val_dic에 존재하지 않습니다.")
                # 필요한 경우 다른 대체값을 추가할 수 있습니다.
                user_culture[doc_id].append(None)  # None으로 빈 값 추가
                
                
    code_list = ['Q2_1_1', 'Q2_1_2', 'Q2_1_3', 'Q2_1_4', 'Q2_1_5']
    document = ''

    for i in user_culture.keys():
        for idx, code in enumerate(code_list):
            value = user_ranking_df.loc[user_ranking_df['ID'] == i, code].values[0]
            if str(value) == '99':
                continue
            tmp_code = f'Q1_{value}'
            document += f'{culture_code_val_dict[tmp_code]} '
    
    final_answer = []
    
    # 사용자가 입력한 문장
    prompt = f'''너는 자연어처리를 통해 사용자에게 정보를 제공하는 챗봇이야 주어진 자료를 가지고 선호도가 높은 정보를 '사용자님과 비슷한 유형의 사람들은 ~에 관심이 높습니다.'로 답해줘 

    자료:
    {document}
    '''

    response = model.generate_content(prompt)
    answer = response.candidates[0].content.parts[0].text
    
    final_answer.append(answer + "<br>")
    final_answer.append("더 많은 여가활동을 알고 싶으시면 아래 버튼을 눌러보세요!")
    final_answer.append("<a href='http://13.125.250.50:5000/culture' style='text-decoration: none; color: white; background-color: #007BFF; padding: 10px 15px; border-radius: 5px; display: inline-block;'>Culture</a>")
    final_answer = '<br>'.join(final_answer)
    
    return final_answer

def cost_chk(message):
    # 여가활동 이름 입력 받기
    def get_activity_ranking(activity_name):
        # 여가활동 코드 추출 함수
        def get_most_common_activity_from_column(df, column, exclude_codes=set()):
            codes = df[column].values
            codes = [code for code in codes if code != 0 and code != 99 and code not in exclude_codes]

            if not codes:
                return "해당 없음", exclude_codes

            most_common_code = Counter(codes).most_common(1)[0][0]
            most_common_activity = culture_code_val_dict.get(f'Q1_{most_common_code}', '알 수 없음')
            exclude_codes.add(most_common_code)
            return most_common_activity, exclude_codes


        # 여가활동명을 코드로 변환하는 함수
        def get_activity_code_by_name(activity_name):
            for key, value in culture_code_val_dict.items():
                if value == activity_name:
                    return int(key.split('_')[1])
            return None


        # 특정 여가활동 평균 비용 계산 함수
        def calculate_activity_average_cost(activity_name):
            activity_code = get_activity_code_by_name(activity_name)
            if activity_code is None:
                return None

            merged_df = pd.merge(user_ranking_df, user_cost_df, on="ID")
            filtered_df = merged_df[
                (merged_df['Q2_1_1'] == activity_code) |
                (merged_df['Q2_1_2'] == activity_code) |
                (merged_df['Q2_1_3'] == activity_code) |
                (merged_df['Q2_1_4'] == activity_code) |
                (merged_df['Q2_1_5'] == activity_code)
            ]

            if filtered_df.empty:
                return None

            relevant_costs = []
            for i in range(1, 6):
                cost_column = f"Q2_5_{i}_N"
                relevant_costs.extend(
                    filtered_df[cost_column][filtered_df[f"Q2_1_{i}"] == activity_code]
                )

            valid_costs = pd.Series(relevant_costs)
            valid_costs = valid_costs[valid_costs > 0]

            if valid_costs.empty:
                return None

            return math.floor(valid_costs.mean())
        
        
        valid_activity_code = get_activity_code_by_name(activity_name)
        if valid_activity_code is None:
            return "유효하지 않은 여가활동명입니다."

        # 입력한 여가활동 평균 비용 계산
        input_activity_cost = calculate_activity_average_cost(activity_name)
        input_cost_text = f"{activity_name} ({input_activity_cost}원)" if input_activity_cost is not None else f"{activity_name} (비용 정보 없음)"

        input_code = valid_activity_code
        filtered_df_1 = user_ranking_df[user_ranking_df['Q2_1_1'] == input_code]
        final_result = []
        final_result.append(f"입력한 여가 활동: {input_cost_text}") 
        final_result.append("이와 유사한 여가 활동과 가격도 추천해 드릴게요!") 

        if not filtered_df_1.empty:
            exclude_codes = set([input_code])
            for rank, column in enumerate(['Q2_1_2', 'Q2_1_3', 'Q2_1_4', 'Q2_1_5'], start=1):
                activity, exclude_codes = get_most_common_activity_from_column(filtered_df_1, column, exclude_codes)
                if activity != "해당 없음":
                    avg_cost = calculate_activity_average_cost(activity)
                    cost_text = f"({avg_cost}원)" if avg_cost is not None else "(비용 정보 없음)"
                    final_result.append(f"{rank}순위: {activity} {cost_text}")
        else:
            # Q2_1_2에서 필터링된 데이터를 기준으로 다시 확인
            filtered_df_2 = user_ranking_df[user_ranking_df['Q2_1_2'] == input_code]
            if not filtered_df_2.empty:
                exclude_codes = set([input_code])
                for rank, column in enumerate(['Q2_1_1', 'Q2_1_3', 'Q2_1_4', 'Q2_1_5'], start=1):
                    activity, exclude_codes = get_most_common_activity_from_column(filtered_df_2, column, exclude_codes)
                    if activity != "해당 없음":
                        avg_cost = calculate_activity_average_cost(activity)
                        cost_text = f"({avg_cost}원)" if avg_cost is not None else "(비용 정보 없음)"
                        final_result.append(f"{rank}순위: {activity} {cost_text}") 
        
        final_result.append("<br>더 많은 여가활동을 알고 싶으시면 아래 버튼을 눌러보세요!")
        final_result.append("<a href='http://127.0.0.1:5000/culture' style='text-decoration: none; color: white; background-color: #007BFF; padding: 10px 15px; border-radius: 5px; display: inline-block;'>Culture</a>")
        final_result = '<br>'.join(final_result) 


        return final_result
    
    for i in range(11):
        if i == 10:
            return '서버에서 요청에 응답하지 못했습니다. 질문을 바꿔주세요.'
        
        try:
            # 사용자가 입력한 문장
            prompt = f'''너는 자연어처리를 이용해서 코드를 반환하는 챗봇이야. 
            아래는 키워드와 코드 딕셔너리이고, 다음 사용자 질문에 비슷한 코드를 찾아서 Q1_00만 말해줘 다른 텍스트는 포함하지 마.
            사용자:
            {message}

            코드:
            {culture_code_val_dict}
            '''

            prompt = prompt.replace("\n", "")
            cleaned_prompt = re.sub(r"\\", "", prompt)
            response = model.generate_content(cleaned_prompt)
            answer = response.candidates[0].content.parts[0].text
            
            act = culture_code_val_dict[answer]
            
            result = get_activity_ranking(act)
            break
        except:
            pass
    
    return result


# 여가활동 코드 입력 받기
def culture_page(code):
    # 여가활동 코드 추출 함수
    def get_most_common_activity_from_column(df, column, exclude_codes=set()):
        # 해당 열에서 값이 0 또는 99가 아닌 값들을 추출하고, 이미 선택된 코드들을 제외
        codes = df[column].values
        # input_code와 관련된 데이터만 필터링 (exclude_codes 제외)
        codes = [code for code in codes if code != 0 and code != 99 and code not in exclude_codes]

        if not codes:
            return "해당 없음", exclude_codes  # 값이 없다면 "해당 없음"을 반환하고, exclude_codes를 반환

        # 가장 많이 나온 여가활동 찾기
        most_common_code = Counter(codes).most_common(1)[0][0]
        most_common_activity = culture_code_val_dict.get(f'Q1_{most_common_code}', '알 수 없음')
        
        # 중복을 방지하기 위해 이 코드를 exclude_codes에 추가
        exclude_codes.add(most_common_code)

        return most_common_activity, exclude_codes

    # 1. 사용자가 입력한 여가활동 코드 받기
    input_code = code[3:]

    # 2. 입력한 여가활동코드를 Q2_1_1에서 찾고 해당 여가활동만 필터링
    filtered_df_1 = user_ranking_df[user_ranking_df['Q2_1_1'] == int(input_code)]

    # 결과 문자열을 저장할 변수
    result_final = []

    # 3. Q2_1_1에서 입력한 값이 존재하는지 확인
    if not filtered_df_1.empty:
        # Q2_1_2에서 가장 많이 나온 여가활동
        exclude_codes = set([input_code])  # 입력된 코드 제외
        activity_2, exclude_codes = get_most_common_activity_from_column(filtered_df_1, 'Q2_1_2', exclude_codes)
        result = f"1순위: {activity_2}" if activity_2 != culture_code_val_dict.get(f'Q1_{input_code}', '알 수 없음') else ""
        result_final.append(result)
        
        # Q2_1_3에서 가장 많이 나온 여가활동
        activity_3, exclude_codes = get_most_common_activity_from_column(filtered_df_1, 'Q2_1_3', exclude_codes)
        result = f"2순위: {activity_3}" if activity_3 != culture_code_val_dict.get(f'Q1_{input_code}', '알 수 없음') else ""
        result_final.append(result)
        
        # Q2_1_4에서 가장 많이 나온 여가활동
        activity_4, exclude_codes = get_most_common_activity_from_column(filtered_df_1, 'Q2_1_4', exclude_codes)
        result = f"3순위: {activity_4}" if activity_4 != culture_code_val_dict.get(f'Q1_{input_code}', '알 수 없음') else ""
        result_final.append(result)
        
        # Q2_1_5에서 가장 많이 나온 여가활동
        activity_5, exclude_codes = get_most_common_activity_from_column(filtered_df_1, 'Q2_1_5', exclude_codes)
        result = f"4순위: {activity_5}" if activity_5 != culture_code_val_dict.get(f'Q1_{input_code}', '알 수 없음') else ""
        result_final.append(result)

    else:
        # Q2_1_2에서 해당 여가활동을 필터링
        filtered_df_2 = user_ranking_df[user_ranking_df['Q2_1_2'] == input_code]
        
        # 필터링된 데이터에서 Q2_1_1, Q2_1_3, Q2_1_4, Q2_1_5에서 각 열을 필터링하여 가장 많이 나온 값 찾기
        exclude_codes = set([input_code])  # 입력된 코드 제외
        activity_1, exclude_codes = get_most_common_activity_from_column(filtered_df_2, 'Q2_1_1', exclude_codes)
        result = f"1순위: {activity_1}" if activity_1 != culture_code_val_dict.get(f'Q1_{input_code}', '알 수 없음') else ""
        result_final.append(result)
        
        activity_3, exclude_codes = get_most_common_activity_from_column(filtered_df_2, 'Q2_1_3', exclude_codes)
        result = f"2순위: {activity_3}" if activity_3 != culture_code_val_dict.get(f'Q1_{input_code}', '알 수 없음') else ""
        result_final.append(result)
        
        activity_4, exclude_codes = get_most_common_activity_from_column(filtered_df_2, 'Q2_1_4', exclude_codes)
        result = f"3순위: {activity_4}" if activity_4 != culture_code_val_dict.get(f'Q1_{input_code}', '알 수 없음') else ""
        result_final.append(result)
        
        activity_5, exclude_codes = get_most_common_activity_from_column(filtered_df_2, 'Q2_1_5', exclude_codes)
        result = f"4순위: {activity_5}" if activity_5 != culture_code_val_dict.get(f'Q1_{input_code}', '알 수 없음') else ""
        result_final.append(result)
    
    result_final = '<br>'.join(result_final)
    
    return result_final