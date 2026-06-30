import { useEffect, useState } from 'react';
import api from '../../utils/api';

const empty = { supplier_name:'', contact_person:'', phone:'', email:'', address:'' };

export default function Suppliers() {
  const [list,  setList]  = useState([]);
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState(empty);
  const [busy,  setBusy]  = useState(false);

  const load = () => { api.get('/suppliers').then(r=>setList(r.data)).catch(()=>{}); };
  useEffect(()=>{ load(); }, []);

  async function save() {
    setBusy(true);
    try {
      if (modal==='add') await api.post('/suppliers', form);
      else await api.put(`/suppliers/${form.supplier_id}`, form);
      setModal(null); load();
    } catch(e) { alert(e.response?.data?.message||'ເກີດຂໍ້ຜິດພາດ'); }
    finally { setBusy(false); }
  }
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title" style={{ margin:0 }}>ຜູ້ສະໜອງສິນຄ້າ</h1>
        <button className="btn btn-primary btn-sm" onClick={()=>{ setForm(empty); setModal('add'); }}>
          + ເພີ່ມຜູ້ສະໜອງ
        </button>
      </div>
      <div className="card" style={{ padding:0 }}>
        <table>
          <thead><tr><th>ຊື່ບໍລິສັດ</th><th>ຜູ້ຕິດຕໍ່</th><th>ເບີໂທ</th><th>ອີເມລ</th><th></th></tr></thead>
          <tbody>
            {list.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', padding:24, color:'#aaa' }}>ຍັງບໍ່ມີຂໍ້ມູນ</td></tr>}
            {list.map(s=>(
              <tr key={s.supplier_id}>
                <td style={{ fontWeight:500 }}>{s.supplier_name}</td>
                <td>{s.contact_person}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm" onClick={()=>{ setForm(s); setModal('edit'); }}>ແກ້ໄຂ</button>
                    <button className="btn btn-danger btn-sm" onClick={async()=>{ if(confirm('ລົບ?')){ await api.delete(`/suppliers/${s.supplier_id}`); load(); } }}>ລົບ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth:480 }}>
            <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:20 }}>
              {modal==='add'?'ເພີ່ມຜູ້ສະໜອງ':'ແກ້ໄຂ'}
            </div>
            <div className="form-group"><label>ຊື່ບໍລິສັດ *</label><input value={form.supplier_name} onChange={e=>F('supplier_name',e.target.value)}/></div>
            <div className="form-row">
              <div className="form-group"><label>ຜູ້ຕິດຕໍ່</label><input value={form.contact_person} onChange={e=>F('contact_person',e.target.value)}/></div>
              <div className="form-group"><label>ເບີໂທ</label><input value={form.phone} onChange={e=>F('phone',e.target.value)}/></div>
            </div>
            <div className="form-group"><label>ອີເມລ</label><input value={form.email} onChange={e=>F('email',e.target.value)}/></div>
            <div className="form-group"><label>ທີ່ຢູ່</label><textarea rows={2} value={form.address} onChange={e=>F('address',e.target.value)} style={{ resize:'none' }}/></div>
            <div className="flex gap-2 mt-3" style={{ justifyContent:'flex-end' }}>
              <button className="btn btn-outline" onClick={()=>setModal(null)}>ຍົກເລີກ</button>
              <button className="btn btn-primary" onClick={save} disabled={busy}>{busy?'ກຳລັງບັນທຶກ...':'ບັນທຶກ'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
