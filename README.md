# 기울여라! — 센서 미로

Surface Pro 11의 기울기 센서로 공을 움직여 미로를 통과하는 작은 웹 게임입니다. HTML, CSS, JavaScript만 사용해 별도 설치 없이 실행할 수 있습니다.

## 실행하기

1. 이 폴더의 `index.html`을 Edge나 Chrome에서 엽니다.
2. 방향키를 누르거나 게임판을 드래그해 공을 움직입니다.
3. 센서가 지원되는 기기에서는 **기울기 센서 켜기**를 눌러 플레이합니다.

센서 API는 브라우저와 기기의 조합에 따라 지원 여부가 다릅니다. Surface에서 센서가 브라우저에 전달되지 않을 때도 방향키와 드래그로 게임을 할 수 있습니다. 센서 접근은 HTTPS 또는 localhost에서 더 잘 지원되므로 GitHub Pages에 게시하면 온라인 주소에서 확인할 수 있습니다.

## GitHub에 올리기

GitHub에서 새 저장소를 만든 뒤, 이 폴더에서 터미널을 열고 아래 명령을 실행하세요. `사용자명`과 `저장소이름`은 본인 계정에 맞게 바꿉니다.

```bash
git init
git add .
git commit -m "첫 번째 센서 미로 게임"
git branch -M main
git remote add origin https://github.com/사용자명/저장소이름.git
git push -u origin main
```

GitHub 저장소의 **Settings → Pages**에서 배포 소스를 `Deploy from a branch`, 브랜치를 `main`, 폴더를 `/ (root)`로 선택하면 웹으로 공개할 수 있습니다.

## 파일 구성

- `index.html`: 게임 화면과 안내 문구
- `style.css`: 색상, 배치, 반응형 화면 스타일
- `game.js`: 센서·키보드 입력과 공의 움직임

## 조작

- 키보드: 방향키 또는 WASD
- 마우스/터치: 게임판에서 누르고 드래그
- 센서: 기울기 센서 켜기 버튼을 누른 뒤 Surface를 기울이기
