const STORAGE = 'mintwise-data-v1';
const categories = {
  expense: ['Food & drinks', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'],
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
};
const icons = {'Food & drinks':'☕',Transport:'🚇',Shopping:'🛍️',Bills:'▦',Health:'✚',Entertainment:'✦',Salary:'✧',Freelance:'⌘',Investment:'↗',Gift:'♡',Other:'•'};
let data = JSON.parse(localStorage.getItem(STORAGE) || 'null') || { goal:{name:'My safety net',target:50000,saved:0}, transactions:[] };
let filter = 'all';
const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
const today = () => new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(STORAGE,JSON.stringify(data))}
function isThisMonth(date){const d=new Date(date+'T00:00:00'),n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}
function totals(){return data.transactions.reduce((r,t)=>{if(isThisMonth(t.date))r[t.type]+=t.amount;return r},{income:0,expense:0})}
function renderCategories(){const type=$('type').value;$('category').innerHTML=categories[type].map(c=>`<option>${c}</option>`).join('')}
function render(){
 const t=totals(), balance=t.income-t.expense;
 $('balance').textContent=money(balance); $('income-total').textContent=money(t.income); $('expense-total').textContent=money(t.expense);
 $('balance-note').textContent=balance>=0?`${money(balance)} available after this month's spending`:'Spending is above this month’s income';
 const g=data.goal;$('goal-title').textContent=g.name;$('saved-amount').textContent=money(g.saved);$('goal-amount').textContent=money(g.target);
 const percent=Math.min(100,Math.round(g.saved/g.target*100)||0);$('goal-progress').style.width=percent+'%';$('goal-message').textContent=percent>=100?'Goal reached — wonderful work!':`${percent}% complete · ${money(Math.max(0,g.target-g.saved))} to go`;
 const expenses=data.transactions.filter(x=>x.type==='expense'&&isThisMonth(x.date));const byCat={};expenses.forEach(x=>byCat[x.category]=(byCat[x.category]||0)+x.amount);const max=Math.max(...Object.values(byCat),1);
 $('category-breakdown').innerHTML=Object.keys(byCat).length?Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([c,a])=>`<div class="category-row"><span class="category-name">${c}</span><div class="category-track"><div class="category-fill" style="width:${a/max*100}%"></div></div><span class="category-value">${money(a)}</span></div>`).join(''):'<p class="empty-state">Add expenses to see your spending pattern.</p>';
 const list=data.transactions.filter(x=>filter==='all'||x.type===filter).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
 $('transaction-list').innerHTML=list.length?list.map(x=>`<article class="transaction"><div class="transaction-icon ${x.type}">${icons[x.category]||'•'}</div><div><div class="transaction-name">${escapeHtml(x.description)}</div><div class="transaction-meta">${x.category} · ${new Date(x.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div></div><div class="transaction-amount ${x.type}">${x.type==='income'?'+':'−'}${money(x.amount)}</div><button class="delete-button" aria-label="Delete transaction" data-id="${x.id}">×</button></article>`).join(''):'<p class="empty-state">No transactions here yet.</p>';
}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
document.querySelectorAll('.type-button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.type-button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('type').value=b.dataset.type;renderCategories()}));
$('transaction-form').addEventListener('submit',e=>{e.preventDefault();const item={id:Date.now(),type:$('type').value,description:$('description').value.trim(),amount:Number($('amount').value),category:$('category').value,date:$('date').value};data.transactions.push(item);save();e.target.reset();$('date').value=today();renderCategories();render()});
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render()}));
$('transaction-list').addEventListener('click',e=>{const id=e.target.dataset.id;if(!id)return;data.transactions=data.transactions.filter(x=>x.id!==Number(id));save();render()});
$('edit-goal').addEventListener('click',()=>{$('goal-name-input').value=data.goal.name;$('goal-target-input').value=data.goal.target;$('goal-dialog').showModal()});$('close-dialog').addEventListener('click',()=>$('goal-dialog').close());
$('goal-form').addEventListener('submit',()=>{data.goal.name=$('goal-name-input').value.trim();data.goal.target=Number($('goal-target-input').value);save();render()});
$('add-savings').addEventListener('click',()=>{const value=Number(prompt('How much would you like to add to savings?'));if(value>0){data.goal.saved+=value;save();render()}});
$('month-label').textContent=new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'});$('date').value=today();renderCategories();render();
