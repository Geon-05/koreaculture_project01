PetiteVue.createApp({
    isNavbarActivated: false, // 네비게이션 바 클래스 상태
    messages: [], // 채팅 메시지 배열
    typingSpeed: 10, // 타이핑 속도 (밀리초)
    userInput: '', // 사용자 입력 값
    isLoading: false, // 로딩 상태
    
        // 메시지 추가 메서드
    addMessage(sender, text) {
        this.messages.push({ sender, text });
        this.scrollToBottom();
    },

    // 타이핑 효과 메서드
    async typingEffect(sender, fullText) {
        const messageIndex = this.messages.length; // 현재 메시지 인덱스
        this.addMessage(sender, ""); // 빈 메시지를 추가 (챗봇 메시지만)

        let index = 0;
        while (index < fullText.length) {
            // 한 글자씩 추가
            this.messages[messageIndex].text += fullText[index];
            index++;

            // 타이핑 속도만큼 대기
            await new Promise(resolve => setTimeout(resolve, this.typingSpeed));
        }
    },
    
    scrollToBottom() {
        const chatMessages = document.querySelector('#chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    },
    
    // 메시지 전송 메서드
    async sendMessage() {
        this.isLoading = true;

        const userInput = this.userInput.trim();
        if (!userInput) return;

        // 사용자 메시지 추가
        this.addMessage('나', userInput);
        this.userInput = '';
        
        // 챗봇 응답 처리
        try {
            const response = await fetch("/chat/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput }),
            });
            const data = await response.json();
            
            // 챗봇 메시지 추가
            this.isLoading = false;
            await this.typingEffect("챗봇", data.reply || "응답을 받을 수 없습니다.");
        } catch (error) {
            console.error("Error:", error);
            this.addMessage("챗봇", "에러가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            // 로딩 상태 비활성화
        }
    },

    
    handleScroll() {
        this.isNavbarActivated = window.scrollY > 10;
    },
    // 스크롤을 채팅 메시지의 맨 아래로 이동
    // 스크롤 이벤트 핸들러

    // 초기화
    mounted() {
        const inputBox = document.querySelector('#user-input');
        inputBox.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });
    },
}).mount('#chat-container'); //"#chat-container"

// JavaScript로 keydown 이벤트 추가
document.addEventListener('DOMContentLoaded', () => {
    const inputBox = document.querySelector('#user-input');
    inputBox.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            document.querySelector('#send-button').click();
        }
    });
});

PetiteVue.createApp({
    recommend(option) {
        alert(`${option}을(를) 추천드립니다!`);
    }
}).mount(".recommendation-container");

PetiteVue.createApp({
    isNavbarActivated: false, // 네비게이션 바 클래스 상태
    testMessage: ' ', // 초기값 설정
    isFetched: false, // 데이터를 가져온 후 색상을 변경하기 위한 상태,
    
    chatbot() {
        console.log("chatbot clicked");
        window.location.replace("/chat");
    },
    culture(){
        console.log("culture clicked");
        // chat.html로 페이지 이동 (경로를 정확하게 수정)
        window.location.href = "/culture"; // culture.html을 정확한 경로로 설정
    },


}).mount()
