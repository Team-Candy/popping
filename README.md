# POPPING

# Workflow

## 1. 레포지토리 클론

```bash
git clone URL
```

- GitHub 레포지토리 URL을 사용해 원격 저장소를 클론합니다.

## 2. 자기 브랜치로 변경

### (1) 원격과 로컬 브랜치 확인

```bash
git branch -a
```

- `git branch -a` 명령어를 사용하여 로컬 브랜치와 원격 브랜치 목록을 모두 확인합니다.

### (2) 원격 저장소의 최신 정보 가져오기

```bash
git fetch
```

- `git fetch`는 원격 저장소의 최신 상태를 로컬로 가져옵니다. 하지만 로컬 브랜치에는 영향을 주지 않고, 원격 브랜치의 상태만 업데이트합니다.

### (3) 로컬 브랜치로 전환

````bash
git checkout SH  # 자신의 브랜치로 이동

## 3. 작업 후 커밋

### (1) 변경 사항 스테이지
```bash
git add .
````

- 작업한 모든 파일을 스테이지에 올립니다. 변경된 파일을 확인하려면 `git status` 명령어를 사용합니다.

### (2) 커밋

```bash
git commit
# i -> insert 모드로 변경
# commit message convention에 맞춰 작성
# esc -> :wq! (저장하고 종료)
```

- 커밋 메시지는 팀의 컨벤션에 맞게 작성합니다.

## 4. 자기 브랜치에 푸시

```bash
git push origin SH
```

- 로컬에서 작업한 내용을 원격 브랜치(`SH`)에 푸시합니다.

## 5. Pull Request (PR) 생성

### GitHub 웹사이트에서 PR 생성

1. GitHub 팀 레포지토리로 가서, `SH` 브랜치에서 `dev` 브랜치로 PR을 생성합니다.
2. **Pull requests** 탭을 클릭합니다.
3. **New Pull Request** 버튼을 클릭합니다.
4. **base** 브랜치를 `dev`로 설정하고, **compare** 브랜치를 자신의 브랜치(`SH`)로 설정합니다.
5. 변경 사항에 대한 설명을 PR 템플릿에 맞추어 작성하고, **Create Pull Request** 버튼을 클릭합니다.

---
