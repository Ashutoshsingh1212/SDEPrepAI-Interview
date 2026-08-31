import React,{useEffect,useState} from "react";
import axios from "axios";
const API=import.meta.env.VITE_API_URL || "https://sdeprepai.onrender.com";
const auth=()=>({headers:{Authorization:`Bearer ${localStorage.getItem("staff_token")||""}`}});
export default function AdminDashboard({user,onLogout}){
 const [stats,setStats]=useState({total:0,completed:0,avg:0,users:0}); const [rows,setRows]=useState([]); const [error,setError]=useState("");
 async function load(){try{const [a,b]=await Promise.all([axios.get(`${API}/api/admin/stats`,auth()),axios.get(`${API}/api/v1/results`,auth())]);setStats(a.data);setRows(b.data||[])}catch(e){setError(e.response?.data?.error||"Could not load admin data")}}
 useEffect(()=>{load()},[]);
 async function clear(){if(!confirm("Delete all interview history?"))return;try{await axios.delete(`${API}/api/v1/interviews/clear`,auth());load()}catch(e){setError(e.response?.data?.error||"Could not clear history")}}
 return <div style={{minHeight:"100vh",background:"#08090c",color:"#fff",padding:32}}><div style={{maxWidth:1150,margin:"auto"}}>
  <header style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",marginBottom:30}}><div><div style={{fontSize:11,letterSpacing:3,color:"#9aa6ff",fontWeight:800}}>ADMIN CONSOLE</div><h1 style={{margin:"8px 0"}}>Welcome, {user?.name||"Admin"}</h1><p style={{color:"#8f98aa",margin:0}}>Manage interviews, users and platform health.</p></div><button onClick={onLogout} style={{padding:"10px 14px",borderRadius:10,border:0,cursor:"pointer"}}>Logout</button></header>
  {error&&<div style={{background:"#3a1114",color:"#ffb3ba",padding:12,borderRadius:10,marginBottom:18}}>{error}</div>}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:28}}>{[["Interviews",stats.total],["Completed",stats.completed],["Average score",stats.avg],['Staff users',stats.users]].map(([k,v])=><div key={k} style={{background:"#11141b",border:"1px solid #292f3d",borderRadius:15,padding:20}}><div style={{color:"#8f98aa",fontSize:12}}>{k}</div><strong style={{fontSize:30}}>{v}</strong></div>)}</div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h2>Recent interviews</h2><button onClick={clear} style={{padding:"9px 13px",borderRadius:9,border:"1px solid #6b2930",background:"#2b1114",color:"#ffb3ba",cursor:"pointer"}}>Clear history</button></div>
  <div style={{overflowX:"auto",background:"#11141b",border:"1px solid #292f3d",borderRadius:15}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{['Candidate','Email','Role','Score','Status'].map(h=><th key={h} style={{textAlign:"left",padding:14,color:"#8f98aa",fontSize:12}}>{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id} style={{borderTop:"1px solid #202630"}}><td style={{padding:14}}>{r.candidate_name}</td><td style={{padding:14,color:"#aeb6c7"}}>{r.candidate_email}</td><td style={{padding:14}}>{r.role}</td><td style={{padding:14}}>{r.score ?? "—"}</td><td style={{padding:14}}>{r.status}</td></tr>)}{!rows.length&&<tr><td colSpan="5" style={{padding:30,textAlign:"center",color:"#8f98aa"}}>No interviews yet.</td></tr>}</tbody></table></div>
 </div></div>
}
