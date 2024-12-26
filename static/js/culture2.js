const { createApp } = Vue;

createApp({
    data() {
        return {
            gifs: [], // 초기 데이터
            isLoading: true, // 로딩 상태
            handleSearch: '',
            rank: '', // 서버 응답 데이터를 저장
        };
    },
    computed: {
        // 검색어를 기준으로 GIF 필터링
        filteredGifs() {
            const query = this.handleSearch.trim().toLowerCase();
            return this.gifs.filter(gif => gif.keyword.toLowerCase().includes(query));
        },
    },
    mounted() {
        // 로딩 시뮬레이션
        setTimeout(() => {
            this.gifs = act_serch();
            this.isLoading = false; // 로딩 상태 해제
        }, 1000);
    },
    methods: {
        chatbot() {
            console.log("chatbot clicked");
            window.location.replace("/chat");
        },
        culture() {
            console.log("culture clicked");
            window.location.replace("/culture");
        },
        async handleClick(keyword, event) {
            console.log(`Clicked GIF Keyword: ${keyword}`);
            const popoverElement = event.currentTarget;

            if (!popoverElement) {
                console.error('Popover element is not defined!');
                return;
            }

            if (!popoverElement.hasAttribute('data-bs-toggle')) {
                console.error('Popover element does not have the required data-bs-toggle attribute!');
                return;
            }

            console.log('Popover element:', popoverElement);

            // 서버와 통신하여 데이터를 가져옴
            await this.someFunction(keyword, popoverElement);
        },
        async someFunction(keyword, popoverElement) {
            try {
                const response = await fetch('/culture2/api/value', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ keyword }), // JSON 데이터 전송
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
        
                const result = await response.json();
                console.log('Server Response:', result);
        
                // 응답 데이터 처리
                this.rank = result.message;
        
                console.log('Popover Element:', popoverElement);
                console.log('Popover Content:', this.rank);
        
                // Popover 인스턴스 생성 또는 업데이트
                let popoverInstance = bootstrap.Popover.getInstance(popoverElement);
        
                if (popoverInstance) {
                    console.log('Updating existing Popover Instance');
                    popoverInstance._config.content = this.rank; // 콘텐츠 업데이트
                    popoverInstance.update();
                } else {
                    console.log('Creating new Popover Instance');
                    popoverInstance = new bootstrap.Popover(popoverElement, {
                        content: this.rank,
                        trigger: 'click',
                        placement: 'top',
                    });
                }
        
                // Popover 표시
                popoverInstance.show();
        
                // 일정 시간 후 자동으로 Popover 닫기
                setTimeout(() => {
                    popoverInstance.hide();
                }, 1500); // 3초 후 닫기
        
                // 외부 클릭 시 Popover 닫기
                document.addEventListener('click', (event) => {
                    if (!popoverElement.contains(event.target)) {
                        popoverInstance.hide();
                    }
                }, { once: true }); // 한 번만 실행
            } catch (error) {
                console.error('Error communicating with the server:', error);
            }
        },
        
        handleInput(event) {
            this.handleSearch = event.target.value; // 검색어 업데이트
        },
        searchbutton() {
            console.log('Search button clicked!');
            // 필요 시 추가 로직 작성
        },
    },
}).mount('#app');


function act_serch() {
    return [ // GIF 데이터 추가
        { "keyword": "가족방문", "code":"Q1_83", "url": "/static/img/가족방문.gif" },
        { "keyword": "걷기", "code":"Q1_71","url": "/static/img/걷기.gif" },
        { "keyword": "격투 스포츠 경기 관람","code":"Q1_18", "url": "/static/img/격투 스포츠 경기 관람.gif" },
        { "keyword": "경기장방문관람","code":"Q1_16", "url": "/static/img/경기장방문관람.gif" },
        { "keyword": "골프","code":"Q1_24", "url": "/static/img/골프.gif" },
        { "keyword": "국내캠핑","code":"Q1_41", "url": "/static/img/국내캠핑.gif" },
        { "keyword": "낚시","code":"Q1_56", "url": "/static/img/낚시.gif" },
        { "keyword": "낮잠","code":"Q1_73", "url": "/static/img/낮잠.gif" },
        { "keyword": "노래방","code":"Q1_53", "url": "/static/img/노래방.gif" },
        { "keyword": "놀이공원","code":"Q1_46", "url": "/static/img/놀이공원.gif" },
        { "keyword": "농구,배구,야구,축구,족구","code":"Q1_20", "url": "/static/img/농구,배구,야구,축구,족구.gif" },
        { "keyword": "당구","code":"Q1_22", "url": "/static/img/당구.gif" },
        { "keyword": "이성교제/데이트/미팅/소개팅","code":"Q1_90", "url": "/static/img/데이트.gif" },
        { "keyword": "독서/만화책/웹툰","code":"Q1_89", "url": "/static/img/독서.gif" },
        { "keyword": "글짓기/독서토론","code":"Q1_10", "url": "/static/img/독서토론.gif" },
        { "keyword": "모바일 컨텐츠/ 동영상/ VOD 시청/ OTT 시청", "code":"Q1_75","url": "/static/img/동영상.gif" },
        { "keyword": "동호회","code":"Q1_87", "url": "/static/img/동호회.gif" },
        { "keyword": "드라이브","code":"Q1_48", "url": "/static/img/드라이브.gif" },
        { "keyword": "등산","code":"Q1_55", "url": "/static/img/등산.gif" },
        { "keyword": "만화/웹툰","code":"Q1_66", "url": "/static/img/만화.png" },
        { "keyword": "목욕/사우나/찜질방","code":"Q1_72", "url": "/static/img/목욕.gif" },
        { "keyword": "무용 공연 관람","code":"Q1_6", "url": "/static/img/무용 공연 관람.gif" },
        { "keyword": "문학행사참여","code":"Q1_9", "url": "/static/img/문학행사 참여.gif" },
        { "keyword": "문화유적방문","code":"Q1_38", "url": "/static/img/문화유적탐방.gif" },
        { "keyword": "미술활동","code":"Q1_11", "url": "/static/img/미술활동.gif" },
        { "keyword": "박물관 관람","code":"Q1_2", "url": "/static/img/박물관 관람.gif" },
        { "keyword": "반려동물","code":"Q1_52", "url": "/static/img/반려동물.gif" },
        { "keyword": "배드민턴/ 줄넘기/ 맨손 체조/ 스트레칭 체조/ 훌라후프","code":"Q1_31", "url": "/static/img/배드민턴.gif" },
        { "keyword": "볼링/탁구","code":"Q1_23", "url": "/static/img/볼링.gif" },
        { "keyword": "분류되지 않은 기타 여가 활동","code":"Q1_88", "url": "/static/img/분류되지 않은 기타 여가 활동.gif" },
        { "keyword": "홈페이지/블로그","code":"Q1_57", "url": "/static/img/블로그.gif" },
        { "keyword": "사이클링/산악자전거","code":"Q1_35", "url": "/static/img/사이클링.gif" },
        { "keyword": "사진촬영","code":"Q1_14", "url": "/static/img/사진촬영.gif" },
        { "keyword": "사회봉사활동","code":"Q1_80", "url": "/static/img/사회봉사활동.gif" },
        { "keyword": "삼림욕","code":"Q1_40", "url": "/static/img/삼림욕.gif" },
        { "keyword": "생활공예","code":"Q1_50", "url": "/static/img/생활공예.gif" },
        { "keyword": "소풍/야유회","code":"Q1_43", "url": "/static/img/소풍.gif" },
        { "keyword": "쇼핑/외식","code":"Q1_63", "url": "/static/img/쇼핑.gif" },
        { "keyword": "수영","code":"Q1_25", "url": "/static/img/수영.gif" },
        { "keyword": "수집활동","code":"Q1_49", "url": "/static/img/수집활동.gif" },
        { "keyword": "스노보드/스키","code":"Q1_27", "url": "/static/img/스노보드.gif" },
        { "keyword": "스포츠 경기 TV,DMB를 통한 관람","code":"Q1_17", "url": "/static/img/스포츠 경기 TV,DMB를 통한 관람.gif" },
        { "keyword": "신문/잡지보기","code":"Q1_78", "url": "/static/img/신문.gif" },
        { "keyword": "아무것도 안하기","code":"Q1_79", "url": "/static/img/아무것도 안하기.gif" },
        { "keyword": "아이스스케이트/아이스하키","code":"Q1_28", "url": "/static/img/아이스스케이트.gif" },
        { "keyword": "악기연주/노래교실","code":"Q1_12", "url": "/static/img/악기연주.gif" },
        { "keyword": "승마/암벽등반/철인삼종경기/서바이벌","code":"Q1_37", "url": "/static/img/암벽등반.gif" },
        { "keyword": "헬스/보디빌딩/에어로빅","code":"Q1_29", "url": "/static/img/에어로빅.gif" },
        { "keyword": "연극 공연 관람","code":"Q1_5", "url": "/static/img/연극 공연 관람.gif" },
        { "keyword": "연예공연 관람","code":"Q1_8", "url": "/static/img/연예공연 관람.gif" },
        { "keyword": "인터넷 검색/ 미디어 제작/ SNS/ 영상편집","code":"Q1_58", "url": "/static/img/영상편집.gif" },
        { "keyword": "영화 관람","code":"Q1_7", "url": "/static/img/영화 관람.gif" },
        { "keyword": "온라인게임 경기관람","code":"Q1_19", "url": "/static/img/온라인게임 경기관람.gif" },
        { "keyword": "요가/필라테스/태보","code":"Q1_30", "url": "/static/img/요가.gif" },
        { "keyword": "요리하기/다도","code":"Q1_51", "url": "/static/img/요리하기.gif" },
        { "keyword": "독서/웹소설","code":"Q1_65", "url": "/static/img/웹소설.gif" },
        { "keyword": "윈드서핑/수상스키/스킨스쿠버다이빙/래프팅/요트","code":"Q1_26", "url": "/static/img/윈드서핑.gif" },
        { "keyword": "유람선","code":"Q1_45", "url": "/static/img/유람선.gif" },
        { "keyword": "음악 연주회 관람","code":"Q1_3", "url": "/static/img/음악 연주회 관람.gif" },
        { "keyword": "음주","code":"Q1_64", "url": "/static/img/음주.gif" },
        { "keyword": "친구만남/이성교제/미팅/소개팅","code":"Q1_86", "url": "/static/img/이성교제.gif" },
        { "keyword": "인라인스케이트","code":"Q1_36", "url": "/static/img/인라인스케이트.gif" },
        { "keyword": "인테리어","code":"Q1_54", "url": "/static/img/인테리어.gif" },
        { "keyword": "자격증","code":"Q1_68", "url": "/static/img/자격증.gif" },
        { "keyword": "자연명승 관람/풍경 관람","code":"Q1_39", "url": "/static/img/자연명승 관람.gif" },
        { "keyword": "전시회 관람","code":"Q1_1", "url": "/static/img/전시회 관람.gif" },
        { "keyword": "전통예술 배우기","code":"Q1_13", "url": "/static/img/전통예술 배우기.gif" },
        { "keyword": "전통예술공연 관람","code":"Q1_4", "url": "/static/img/전통예술공연 관람.gif" },
        { "keyword": "육상/조깅/속보","code":"Q1_32", "url": "/static/img/조깅.gif" },
        { "keyword": "종교활동","code":"Q1_81", "url": "/static/img/종교활동.gif" },
        { "keyword": "지역축제","code":"Q1_47", "url": "/static/img/지역축제.gif" },
        { "keyword": "바둑/장기/체스","code":"Q1_61", "url": "/static/img/체스.gif" },
        { "keyword": "춤/무용","code":"Q1_15", "url": "/static/img/춤.gif" },
        { "keyword": "친구만남/동호회","code":"Q1_91", "url": "/static/img/친구만남.gif" },
        { "keyword": "겜블/경마/경륜/카지노/카드놀이/고스톱/마작/복권구입","code":"Q1_62", "url": "/static/img/카지노.gif" },
        { "keyword": "온라인게임/모바일게임/콘솔 게임","code":"Q1_59", "url": "/static/img/콘솔 게임.gif" },
        { "keyword": "클럽/나이트/디스코/캬바레","code":"Q1_82", "url": "/static/img/클럽.gif" },
        { "keyword": "태권도/유도/합기도/검도/권투","code":"Q1_33", "url": "/static/img/택권도.gif" },
        { "keyword": "탱고/왈츠/자이브/맘보.폴카/차차차","code":"Q1_34", "url": "/static/img/탱고.gif" },
        { "keyword": "테니스/스쿼시","code":"Q1_21", "url": "/static/img/테니스.gif" },
        { "keyword": "잡담/통화하기/문자보내기/모바일 메신저/메시지","code":"Q1_84", "url": "/static/img/통화하기.gif" },
        { "keyword": "계/동창회/사교/파티","code":"Q1_85", "url": "/static/img/파티.gif" },
        { "keyword": "라디오/팟캐스트","code":"Q1_76", "url": "/static/img/팟캐스트.gif" },
        { "keyword": "보드게임/퍼즐/큐브","code":"Q1_60", "url": "/static/img/퍼즐.gif" },
        { "keyword": "미용/피부관리/헤어관리/네일아트.마사지/성형","code":"Q1_67", "url": "/static/img/피부관리.gif" },
        { "keyword": "온천/해수욕","code":"Q1_44", "url": "/static/img/해수욕.gif" },
        { "keyword": "해외여행","code":"Q1_42", "url": "/static/img/해외캠핑.gif" },
        { "keyword": "원예/화분/화단가꾸기","code":"Q1_70", "url": "/static/img/화분.gif" },
        { "keyword": "TV/IPTV","code":"Q1_74", "url": "/static/img/TV.gif" },
        { "keyword": "테마카페/방탈출/VR/낚시카페","code":"Q1_69", "url": "/static/img/VR.gif" }
        // 
    ]
}