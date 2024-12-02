// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDt6s-jeWTE9zSAGo650qD60_qJJ9vLoYA",
    authDomain: "ricky50204-5cd1d.firebaseapp.com",
    projectId: "ricky50204-5cd1d",
    storageBucket: "ricky50204-5cd1d.firebasestorage.app",
    messagingSenderId: "149513385579",
    appId: "1:149513385579:web:ed93ccc6611a7b7bc7e32e",
    measurementId: "G-VS70EMRKEJ"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// 元素選取
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const memberSection = document.getElementById('memberSection');
const memberInfo = document.getElementById('memberInfo');
const notesList = document.getElementById('notesList');

// 顯示會員資料
function displayMemberInfo(user) {
    memberSection.classList.remove('d-none');
    loginForm.classList.add('d-none');
    registerForm.classList.add('d-none');
    memberInfo.innerHTML = `
        <p><strong>名稱：</strong> ${user.displayName || '未提供'}</p>
        <p><strong>Email：</strong> ${user.email}</p>
    `;
    loadNotes(user.uid);
}

// 登出功能
document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert('您已成功登出！');
        window.location.reload();
    } catch (error) {
        alert(`錯誤：${error.message}`);
    }
});

// 監聽登入狀態
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayMemberInfo(user);
    }
});

/// 處理新增筆記
document.getElementById('addNoteForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    
    // 取得筆記內容
    const noteContent = document.getElementById('noteContent').value;

    // 檢查筆記內容是否為空
    if (noteContent.trim() === '') {
        alert('筆記內容不能為空');
        return;
    }

    const user = auth.currentUser;

    // 檢查用戶是否已登入
    if (!user) {
        alert('請先登入');
        return;
    }

    console.log("當前登入用戶:", user);

    // 將筆記資料寫入 Firestore
    try {
        await addDoc(collection(db, 'notes'), {
            uid: user.uid,             // 用戶 ID
            content: noteContent,      // 筆記內容
            createdAt: new Date()      // 創建時間
        });

        alert('筆記新增成功！');
        document.getElementById('noteContent').value = ''; // 清空輸入框
        loadNotes(user.uid); // 重新載入筆記
    } catch (error) {
        console.error("新增筆記錯誤:", error); // 顯示錯誤訊息
        alert(`錯誤：${error.message}`);
    }
});

// 載入用戶筆記
async function loadNotes(uid) {
    notesList.innerHTML = '<p>載入中...</p>';
    const notesQuery = query(collection(db, 'notes'), where('uid', '==', uid));

    try {
        const querySnapshot = await getDocs(notesQuery);
        notesList.innerHTML = '';
        if (querySnapshot.empty) {
            notesList.innerHTML = '<p>尚無筆記。</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const note = doc.data();
                const noteItem = document.createElement('li');
                noteItem.classList.add('list-group-item');
                noteItem.textContent = note.content;
                notesList.appendChild(noteItem);
            });
        }
    } catch (error) {
        console.error("載入筆記錯誤:", error); // 顯示錯誤訊息
        alert(`無法載入筆記：${error.message}`);
    }
}



// 處理登入
loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        displayMemberInfo(user);
    } catch (error) {
        alert(`錯誤：${error.message}`);
    }
});

// 處理註冊
registerForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        displayMemberInfo(user);
    } catch (error) {
        alert(`錯誤：${error.message}`);
    }
});

// 處理 Google 登入
document.getElementById('googleLogin').addEventListener('click', async function () {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        displayMemberInfo(user);
    } catch (error) {
        alert(`錯誤：${error.message}`);
    }
});
