const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
fs.mkdirSync(DATA_DIR, {recursive:true});
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
const saveUsers = users => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
const challenges = new Map();
if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) { throw new Error('Defina SESSION_SECRET com pelo menos 32 caracteres em produção.'); }
const mailReady = ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','MAIL_FROM'].every(k => process.env[k]);
const transporter = mailReady ? nodemailer.createTransport({
  host:process.env.SMTP_HOST, port:Number(process.env.SMTP_PORT), secure:String(process.env.SMTP_SECURE || 'false') === 'true',
  auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}
}) : null;

app.use(express.json({limit:'20kb'}));
app.use(session({name:'cheatset.sid', secret:process.env.SESSION_SECRET || 'CHANGE-THIS-SECRET-BEFORE-DEPLOY', resave:false, saveUninitialized:false,
  cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV === 'production',maxAge:7*24*60*60*1000}}));
app.use('/api/auth', rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:true,legacyHeaders:false}));
app.use(express.static(__dirname));

function cleanUser(u){ return {id:u.id,name:u.name,username:u.username,email:u.email}; }
function makeCode(){ return String(Math.floor(100000 + Math.random()*900000)); }
async function sendCode(email, code, purpose){
  if (!transporter) throw new Error('E-mail não configurado no servidor. Configure o arquivo .env.');
  await transporter.sendMail({from:process.env.MAIL_FROM,to:email,subject:purpose === 'register' ? 'Confirme sua conta Cheat Set' : 'Seu código de acesso Cheat Set',
    text:`Seu código de verificação do Cheat Set é: ${code}\n\nEle expira em 10 minutos. Se você não solicitou este código, ignore esta mensagem.`,
    html:`<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#17202b"><h2>Cheat Set</h2><p>Use este código para ${purpose === 'register' ? 'confirmar seu cadastro' : 'entrar na sua conta'}:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:18px;background:#f2f4f7;text-align:center;border-radius:10px">${code}</div><p>O código expira em 10 minutos. Se não foi você, ignore esta mensagem.</p></div>`});
}
function setChallenge(email,purpose,data){ const code=makeCode(); challenges.set(`${purpose}:${email}`,{code,expires:Date.now()+10*60*1000,attempts:0,data}); return code; }

app.post('/api/auth/register', async (req,res) => {
  try {
    const {name,username,email,password}=req.body || {};
    const normalizedEmail=String(email||'').trim().toLowerCase();
    const normalizedUser=String(username||'').trim().toLowerCase();
    if (!name || String(name).trim().length>80 || !/^[a-z0-9_]{3,30}$/.test(normalizedUser) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || typeof password!=='string' || password.length<8 || password.length>128)
      return res.status(400).json({error:'Confira os dados. A senha deve ter entre 8 e 128 caracteres.'});
    const users=readUsers();
    if(users.some(u=>u.email===normalizedEmail || u.username===normalizedUser)) return res.status(409).json({error:'Este e-mail ou nome de usuário já está cadastrado.'});
    const passwordHash=await bcrypt.hash(password,12);
    const code=setChallenge(normalizedEmail,'register',{id:require('crypto').randomUUID(),name:String(name).trim(),username:normalizedUser,email:normalizedEmail,passwordHash});
    await sendCode(normalizedEmail,code,'register');
    res.json({ok:true,email:normalizedEmail});
  } catch(e){ console.error(e); res.status(500).json({error:e.message.includes('não configurado')?e.message:'Não foi possível enviar o código. Tente novamente.'}); }
});

app.post('/api/auth/login', async (req,res) => {
  try {
    const identifier=String(req.body?.identifier||'').trim().replace(/^@/,'').toLowerCase();
    const password=String(req.body?.password||'');
    const user=readUsers().find(u=>u.email===identifier || u.username===identifier);
    if(!user || !(await bcrypt.compare(password,user.passwordHash))) return res.status(401).json({error:'E-mail/usuário ou senha incorretos.'});
    const code=setChallenge(user.email,'login',{userId:user.id});
    await sendCode(user.email,code,'login');
    res.json({ok:true,email:user.email});
  } catch(e){ console.error(e); res.status(500).json({error:e.message.includes('não configurado')?e.message:'Não foi possível enviar o código. Tente novamente.'}); }
});

app.post('/api/auth/resend', async (req,res) => {
  try {
    const email=String(req.body?.email||'').trim().toLowerCase();
    const purpose=req.body?.purpose;
    if(!['register','login'].includes(purpose)) return res.status(400).json({error:'Solicitação inválida.'});
    const old=challenges.get(`${purpose}:${email}`);
    if(!old || old.expires<Date.now()) return res.status(400).json({error:'A verificação expirou. Refaça o cadastro ou login.'});
    const code=setChallenge(email,purpose,old.data);
    await sendCode(email,code,purpose);
    res.json({ok:true});
  } catch(e){ console.error(e); res.status(500).json({error:'Não foi possível reenviar o código.'}); }
});

app.post('/api/auth/verify', async (req,res) => {
  const email=String(req.body?.email||'').trim().toLowerCase();
  const code=String(req.body?.code||'').trim();
  const purpose=req.body?.purpose;
  if(!['register','login'].includes(purpose)) return res.status(400).json({error:'Verificação inválida.'});
  const key=`${purpose}:${email}`, challenge=challenges.get(key);
  if(!challenge || challenge.expires<Date.now() || challenge.attempts>=5){challenges.delete(key);return res.status(400).json({error:'Código expirado. Solicite um novo código.'});}
  challenge.attempts++;
  if(!/^\d{6}$/.test(code) || code!==challenge.code) return res.status(400).json({error:'Código incorreto. Confira e tente novamente.'});
  challenges.delete(key);
  let user;
  if(purpose==='register'){
    const users=readUsers();
    if(users.some(u=>u.email===email || u.username===challenge.data.username)) return res.status(409).json({error:'E-mail ou usuário já cadastrado.'});
    user=challenge.data; users.push(user); saveUsers(users);
  } else {
    user=readUsers().find(u=>u.id===challenge.data.userId);
    if(!user) return res.status(401).json({error:'Conta não encontrada.'});
  }
  req.session.userId=user.id;
  res.json({ok:true,user:cleanUser(user)});
});

app.post('/api/auth/logout',(req,res)=>req.session.destroy(()=>{res.clearCookie('cheatset.sid');res.json({ok:true});}));
app.get('/api/auth/me',(req,res)=>{
  if(!req.session.userId) return res.status(401).json({user:null});
  const user=readUsers().find(u=>u.id===req.session.userId);
  if(!user){req.session.destroy(()=>{});return res.status(401).json({user:null});}
  res.json({user:cleanUser(user)});
});

app.listen(PORT,()=>console.log(`Cheat Set disponível em http://localhost:${PORT}`));
