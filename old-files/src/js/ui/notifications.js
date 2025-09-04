export function showNotification(message, type='info') {
  const n = document.createElement('div');
  n.className='fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full';
  const colors={success:'bg-green-500',error:'bg-red-500',info:'bg-blue-500'};
  n.classList.add(colors[type]||colors.info);
  n.textContent=message; document.body.appendChild(n);
  setTimeout(()=>{n.classList.remove('translate-x-full');},100);
  setTimeout(()=>{n.classList.add('translate-x-full'); setTimeout(()=>n.remove(),300);},3000);
}
