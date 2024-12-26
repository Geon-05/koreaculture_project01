PetiteVue.createApp({
    isNavbarActivated: false, // 네비게이션 바 클래스 상태
    testMessage: ' ', // 초기값 설정
    isFetched: false, // 데이터를 가져온 후 색상을 변경하기 위한 상태,
    handleSearch: '',

    chatbot(){
        console.log("chatbot clicked");
        // chat.html로 페이지 이동 (경로를 정확하게 수정)
        window.location.replace("/chat"); // culture.html을 정확한 경로로 설정
    },
    
    culture() {
        console.log("culture clicked");
        window.location.replace("/culture");  // 현재 페이지 유지 또는 다른 동작 추가 가능
    },
    
    
    handleInput(event) {
        // handleInput은 사용자가 입력할 때마다 호출됩니다.
        this.handleSearch = event.target.value;
        this.searchbutton();
    },

    
    searchbutton() {
        const query = this.handleSearch.trim().toLowerCase();
        const gifContainers = document.querySelectorAll('.gif-container');
        const addHoverTextBox = (container, text) => {
            let hoverTextBox = container.querySelector('.hover-text-box');
            if (!hoverTextBox) {
                hoverTextBox = document.createElement('div');
                hoverTextBox.className = 'hover-text-box';
                hoverTextBox.textContent = `${text}`;
                container.appendChild(hoverTextBox);
            }
        };
        
        // 검색어가 없으면 모든 GIF를 표시
        if (query === '') {
            gifContainers.forEach(container => {
                container.style.display = '';
                container.classList.remove('hoverable');
                // 기존의 hover 텍스트 박스 제거
                const existingHoverBox = container.querySelector('.hover-text-box');
                if (existingHoverBox) {
                    existingHoverBox.remove();
                }
            });
            return;
        }

        // 검색어가 있는 경우 필터링
        gifContainers.forEach(container => {
            const titleElement = container.querySelector('.centered-text');
            if (titleElement) {
                const title = titleElement.textContent.trim().toLowerCase();
                if (title.includes(query)) {
                    container.style.display = '';
                    container.classList.add('hoverable'); // hover 효과를 위한 클래스 추가
                    addHoverTextBox(container, title); // 텍스트 박스 추가
                } else {
                    container.style.display = 'none';
                }
            }
        });

    },


}).mount();
                    


