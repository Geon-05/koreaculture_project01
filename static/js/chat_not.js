PetiteVue.createApp({
    isNavbarActivated: false,
    messages: [], // 채팅 메시지 배열
    typingSpeed: 50, // 타이핑 속도 (밀리초)
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
            this.messages[messageIndex - 1].text += fullText[index];
            index++;

            // 타이핑 속도만큼 대기
            await new Promise(resolve => setTimeout(resolve, this.typingSpeed));
        }
    },

    // 스크롤을 채팅 메시지의 맨 아래로 이동
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

        try {
            const response = await fetch("/chat/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput }),
            });
            const data = await response.json();

            // 챗봇 메시지를 타이핑 효과로 표시
            await this.typingEffect("챗봇", data.reply || "응답을 받을 수 없습니다.");
        } catch (error) {
            console.error("Error:", error);
            this.addMessage("챗봇", "에러가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            this.isLoading = false;
        }
    },

    // 초기화
    mounted() {
        const inputBox = document.querySelector('#user-input');
        inputBox.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });
    },
}).mount('#app');
