import { firebaseConfig } from '../config/firebaseConfig.js';

export class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.user = null;
  }
  async init() {
    if (this.app) return;
    const scripts = [
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
    ];
    for (const s of scripts) {
      await new Promise((res, rej)=>{const el=document.createElement('script'); el.src=s; el.onload=res; el.onerror=rej; document.head.appendChild(el);});
    }
    // global firebase
    this.app = firebase.initializeApp(firebaseConfig);
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.auth.onAuthStateChanged(u=>{this.user=u; if (this.onAuthChange) this.onAuthChange(u);});
  }
  async signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    await this.auth.signInWithPopup(provider);
  }
  signOut() { return this.auth.signOut(); }
  async saveData(data) {
    if (!this.user) return;
    const ref = this.db.collection('budgetMaster').doc(this.user.uid);
    await ref.set({...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp(), version:'1.0'}, {merge:true});
  }
  async loadData() {
    if (!this.user) return null;
    const ref = await this.db.collection('budgetMaster').doc(this.user.uid).get();
    return ref.exists ? ref.data() : null;
  }
}
