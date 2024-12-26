from flask import Flask, render_template,redirect,url_for, jsonify, request # type: ignore
import webbrowser
from threading import Timer
from src.chat import intention, culture_page


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat')
def chat():
    return render_template('chat.html') #chat.html

@app.route('/culture')
def culture():
    return render_template('culture.html')

@app.route('/culture2')
def culture2():
    return render_template('culture2.html')


@app.route('/get_data', methods=['POST'])
def get_data():
    result = "Task completed successfully!"
    return jsonify(result=result)

@app.route('/chat/api/chat', methods=['POST'])
def chat_api():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        # user_message : user메시지를 전달받음
        # response : 내부로직을통해 챗봇메시지를 전달하도록함
        response = intention(user_message)
        return jsonify({"reply": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/culture/api/value_ser', methods=['POST'])
def culture_ser():
    print("Headers:", request.headers)
    print("Body:", request.data)
    data = request.get_json()
    print("Parsed JSON:", data)

@app.route('/culture/api/value', methods=['POST'])
def process_keyword():
    try:
        data = request.json  # 클라이언트에서 보낸 JSON 데이터를 받음
        keyword = data.get('keyword')  # 키워드 값 추출
        code = data.get('code')  # 키워드 값 추출
        print(f"Received keyword: {keyword}")

        # 결과 메시지 생성
        response_message = culture_page(code)
        return jsonify({"message": response_message}), 200
    except Exception as e:
        print(f"Error processing keyword: {e}")
        return jsonify({"error": "An error occurred while processing the keyword."}), 500




@app.route('/favicon.ico')
def favicon():
    return '', 204

# def open_browser():
#     webbrowser.open_new("http://127.0.0.1:5000/")


if __name__ == '__main__':
    # Timer(1, open_browser).start()  # 서버 시작 후 1초 뒤에 브라우저 열기 
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)

