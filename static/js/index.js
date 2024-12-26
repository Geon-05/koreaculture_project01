PetiteVue.createApp({
    isNavbarActivated: false, // 네비게이션 바 클래스 상태
    testMessage: ' ', // 초기값 설정
    isFetched: false, // 데이터를 가져온 후 색상을 변경하기 위한 상태,

    fetchData() {
        console.log("Fetching data from server...");
        fetch('/get_data', { method: 'POST' })
            .then(response => response.json())
            .then((data) => {
                this.isFetched = true; // 데이터를 가져온 후 isFetched를 true로 변경
            })
            .catch(error => console.error('Error fetching data:', error));
    },

    // 챗봇 페이지로 이동하는 메서드
    startChat() {
        console.log("startChat clicked");
        // index.html로 페이지 이동 (경로를 정확하게 수정)
        window.location.href = "/chat"; // chat.html을 정확한 경로로 설정
    },

    chatbot(){
        console.log("chatbot clicked");
        // chat.html로 페이지 이동 (경로를 정확하게 수정)
        window.location.href = "/chat"; // chat.html을 정확한 경로로 설정
    },

    culture(){
        console.log("culture clicked");
        // culture.html로 페이지 이동 (경로를 정확하게 수정)
        window.location.href = "/culture"; // culture.html을 정확한 경로로 설정
    },

   




}).mount();


