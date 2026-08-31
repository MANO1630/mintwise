const STORAGE = 'mintwise-data-v1';
const categories = {expense:['Food & drinks','Transport','Shopping','Bills','Health','Entertainment','Other'],income:['Salary','Freelance','Investment','Gift','Other']};
const icons = {'Food & drinks':'☕',Transport:'🚇',Shopping:'🛍️',Bills:'▦',Health:'✚',Entertainment:'✦',Salary:'✧',Freelance:'⌘',Investment:'↗',Gift:'♡',Other:'•'};
let data = JSON.parse(localStorage.getItem(STORAGE) || 'null') || {goal:{name:'My safety net',target:50000,saved:0},transactions:[]};
let filter = 'all';
let dateFilter = 'all';
const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
const today = () => new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(STORAGE,JSON.stringify(data))}
function isThisMonth(date){const d=new Date(date+'T00:00:00'),n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}
function totals(){return data.transactions.reduce((r,t)=>{if(isThisMonth(t.date))r[t.type]+=t.amount;return r},{income:0,expense:0})}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function updateCustomCategory(){const isOther=$('category').value==='Other';$('custom-category-wrap').hidden=!isOther;$('custom-category').required=isOther;if(!isOther)$('custom-category').value=''}
function renderCategories(){const type=$('type').value;$('category').innerHTML=categories[type].map(c=>`<option>${c}</option>`).join('');updateCustomCategory()}
function matchesDateFilter(transaction){if(dateFilter==='today')return transaction.date===today();if(dateFilter==='month')return isThisMonth(transaction.date);if(dateFilter==='custom')return transaction.date===$('custom-filter-date').value;return true}
function render(){
 const t=totals(),balance=t.income-t.expense;
 $('balance').textContent=money(balance);$('income-total').textContent=money(t.income);$('expense-total').textContent=money(t.expense);
 $('balance-note').textContent=balance>=0?`${money(balance)} available after this month's spending`:'Spending is above this month’s income';
 const g=data.goal;$('goal-title').textContent=g.name;$('saved-amount').textContent=money(g.saved);$('goal-amount').textContent=money(g.target);
 const percent=Math.min(100,Math.round(g.saved/g.target*100)||0);$('goal-progress').style.width=percent+'%';$('goal-message').textContent=percent>=100?'Goal reached — wonderful work!':`${percent}% complete · ${money(Math.max(0,g.target-g.saved))} to go`;
 const expenses=data.transactions.filter(x=>x.type==='expense'&&isThisMonth(x.date)),byCat={};expenses.forEach(x=>byCat[x.category]=(byCat[x.category]||0)+x.amount);const max=Math.max(...Object.values(byCat),1);
 $('category-breakdown').innerHTML=Object.keys(byCat).length?Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([c,a])=>`<div class="category-row"><span class="category-name">${escapeHtml(c)}</span><div class="category-track"><div class="category-fill" style="width:${a/max*100}%"></div></div><span class="category-value">${money(a)}</span></div>`).join(''):'<p class="empty-state">Add expenses to see your spending pattern.</p>';
 const list=data.transactions.filter(x=>(filter==='all'||x.type===filter)&&matchesDateFilter(x)).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
 $('transaction-list').innerHTML=list.length?list.map(x=>`<article class="transaction"><div class="transaction-icon ${x.type}">${icons[x.category]||'•'}</div><div><div class="transaction-name">${escapeHtml(x.description)}</div><div class="transaction-meta">${escapeHtml(x.category)} · ${new Date(x.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div></div><div class="transaction-amount ${x.type}">${x.type==='income'?'+':'−'}${money(x.amount)}</div><button class="transaction-remove" type="button" data-id="${x.id}">Remove</button></article>`).join(''):'<p class="empty-state">No transactions match these filters.</p>';
}
document.querySelectorAll('.type-button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.type-button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('type').value=b.dataset.type;renderCategories()}));
$('category').addEventListener('change',updateCustomCategory);
$('transaction-form').addEventListener('submit',e=>{e.preventDefault();const selected=$('category').value;const item={id:Date.now(),type:$('type').value,description:$('description').value.trim(),amount:Number($('amount').value),category:selected==='Other'?$('custom-category').value.trim():selected,date:$('date').value};data.transactions.push(item);save();e.target.reset();$('date').value=today();renderCategories();render()});
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render()}));
$('date-filter').addEventListener('change',e=>{dateFilter=e.target.value;$('custom-filter-date').hidden=dateFilter!=='custom';if(dateFilter==='custom'&&!$('custom-filter-date').value)$('custom-filter-date').value=today();render()});
$('custom-filter-date').addEventListener('change',render);
$('transaction-list').addEventListener('click',e=>{const id=e.target.dataset.id;if(id&&confirm('Remove this transaction?')){data.transactions=data.transactions.filter(x=>x.id!==Number(id));save();render()}});
$('edit-goal').addEventListener('click',()=>{$('goal-name-input').value=data.goal.name;$('goal-target-input').value=data.goal.target;$('goal-saved-input').value=data.goal.saved;$('adjustment-type').value='add';$('adjustment-amount').value='0';$('goal-dialog').showModal()});
$('close-dialog').addEventListener('click',()=>$('goal-dialog').close());
$('goal-form').addEventListener('submit',()=>{const adjustment=Number($('adjustment-amount').value)||0;const saved=Number($('goal-saved-input').value);data.goal.name=$('goal-name-input').value.trim();data.goal.target=Number($('goal-target-input').value);data.goal.saved=Math.max(0,saved+($('adjustment-type').value==='deduct'?-adjustment:adjustment));save();render()});
$('add-savings').addEventListener('click',()=>{const value=Number(prompt('How much would you like to add to savings?'));if(value>0){data.goal.saved+=value;save();render()}});
$('month-label').textContent=new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'});$('date').value=today();renderCategories();render();
