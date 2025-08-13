import { FirebaseService } from './services/firebaseService.js';
import { pastelColors } from './budgetManager/constants.js';
import { showNotification } from './ui/notifications.js';

class BudgetManager {
  constructor(firebaseService){
    this.firebase = firebaseService;
    this.data = this.loadLocal();
    this.settings = this.loadSettings();
    this.pastelColors = pastelColors;
    this.isSignedIn=false;
  }
  async init(){
    await this.firebase.init();
    this.firebase.onAuthChange = async (u)=>{
      this.isSignedIn=!!u;
      if (u){
        const cloud = await this.firebase.loadData();
        if (cloud && cloud.income && cloud.expenses) { this.data={income:cloud.income,expenses:cloud.expenses,bankAccounts:cloud.bankAccounts||[]}; this.saveLocal(); this.updateDisplay(); }
      }
      this.updateCloudUI();
    };
    this.bindEvents();
    this.updateDisplay();
  }
  bindEvents(){
    const cloudBtn=document.getElementById('googleDriveBtn');
    if (cloudBtn) cloudBtn.addEventListener('click',()=> this.handleCloud());
  }
  handleCloud(){
    if(!this.isSignedIn) this.firebase.signInWithGoogle().catch(()=>showNotification('Sign-in failed','error')); else this.firebase.signOut();
  }
  updateCloudUI(){
    // simplified placeholder; real UI remains in original index until fully refactored
  }
  loadLocal(){ const s=localStorage.getItem('budgetMasterData'); return s?JSON.parse(s):{income:[],expenses:[],bankAccounts:[]}; }
  saveLocal(){ localStorage.setItem('budgetMasterData', JSON.stringify(this.data)); }
  loadSettings(){ const s=localStorage.getItem('budgetMasterSettings'); return s?JSON.parse(s):{theme:'light',currency:'USD'}; }
  updateDisplay(){ /* TODO: move original rendering pieces here modularly */ }
}

const firebaseService = new FirebaseService();
const app = new BudgetManager(firebaseService);
app.init();

export default app;
