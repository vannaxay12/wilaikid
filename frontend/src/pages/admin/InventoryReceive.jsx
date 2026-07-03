import { useState, useEffect } from 'react';
import api from '../../utils/api';

const fmt = n => `₭${Number(n||0).toLocaleString()}`;

export default function InventoryReceive() {
  const [receipts,  setReceipts]  = useState([]);
  const [products,  setProducts]  = useState([]);
  const [modal,     setModal]     = useState(false);
  const [detail,    setDetail]    = useState(null);
  const [busy,      setBusy]      = useState(false);
  const [form,      setForm]      = useState({ notes:'' });
  const [items,     setItems]     = useState([{ product_id:'', qty:1, unit_cost:'' }]);

  const load = () => {
    api.get('/inventory').then(r => setReceipts(r.data)).catch(()=>{});
  };

  useEffect(() => {
    load();
    api.get('/products').then(r => setProducts(r.data)).catch(()=>{});
  }, []);

  function addItem() {
    setItems(it => [...it, { product_id:'', qty:1, unit_cost:'' }]);
  }

  function removeItem(i) {
    setItems(it => it.filter((_,idx) => idx !== i));
  }

  function updateItem(i, key, val) {
    setItems(it => it.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [key]: val };
      // ໃສ່ລາຄາທຶນອັດຕະໂນມັດ ເມື່ອເລືອກສິນຄ້າ
      if (key === 'product_id') {
        const p = products.find(p => p.product_id == val);
        if (p) updated.unit_cost = p.cost_price;
      }
      return updated;
    }));
  }

  const total = items.reduce((s,i) => s + (Number(i.qty)||0) * (Number(i.unit_cost)||0), 0);

  async function save() {
    if (!items.length || !items[0].product_id) { alert('ກະລຸນາເລືອກສິນຄ້າ'); return; }
    setBusy(true);
    try {
      await api.post('/inventory', {
        notes: form.notes,
        items: items.filter(i => i.product_id).map(i => ({
          product_id: Number(i.product_id),
          qty_received: Number(i.qty),
          unit_cost: Number(i.unit_cost),
        }))
      });
      setModal(false);
      setItems([{ product_id:'', qty:1, unit_cost:'' }]);
      setForm({ notes:'' });
      load();
    } catch (e) { alert(e.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ'); }
    finally { setBusy(false); }
  }

  async function openDetail(id) {
    try {
      const { data } = await api.get(`/inventory/${id}`);
      setDetail(data);
    } catch { alert('ໂຫລດລາຍລະອຽດບໍ່ໄດ້'); }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title" style={{ margin:0 }}>ນຳເຂົ້າສິນຄ້າ</h1>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>
          + ບັນທຶກການນຳເຂົ້າ
        </button>
      </div>

      <div className="card" style={{ padding:0 }}>
        <table>
          <thead>
            <tr>
              <th>ເລກທີ</th>
              <th>ວັນທີຮັບ</th>
              <th>ຜູ້ຮັບ</th>
              <th className="text-right">ລາຍການ</th>
              <th className="text-right">ຕົ້ນທຶນລວມ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'#aaa' }}>
                ຍັງບໍ່ມີການນຳເຂົ້າ
              </td></tr>
            )}
            {receipts.map(r => (
              <tr key={r.receipt_id}>
                <td className="mono" style={{ fontWeight:600, color:'#185FA5' }}>{r.receipt_number}</td>
                <td>{new Date(r.received_at).toLocaleString('lo-LA')}</td>
                <td>{r.employee_name}</td>
                <td className="text-right">{r.item_count} ລາຍ</td>
                <td className="text-right mono" style={{ fontWeight:600, color:'#c0392b' }}>
                  {fmt(r.total_cost)}
                </td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={()=>openDetail(r.receipt_id)}>
                    ລາຍລະອຽດ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth:620 }}>
            <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:20 }}>
              📥 ບັນທຶກການນຳເຂົ້າສິນຄ້າ
            </div>

            <div className="form-group">
              <label htmlFor="inv-notes">ໝາຍເຫດ</label>
              <input id="inv-notes" name="notes" value={form.notes}
                onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                placeholder="ໝາຍເຫດ (ຖ້າມີ)" />
            </div>

            <div style={{ fontWeight:600, marginBottom:10 }}>ລາຍການສິນຄ້າ</div>

            {items.map((item, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto',
                gap:8, marginBottom:8, alignItems:'center' }}>
                <select value={item.product_id}
                  onChange={e=>updateItem(i,'product_id',e.target.value)}>
                  <option value="">-- ເລືອກສິນຄ້າ --</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                  ))}
                </select>
                <input type="number" value={item.qty} min={1}
                  onChange={e=>updateItem(i,'qty',e.target.value)}
                  placeholder="ຈຳນວນ" />
                <input type="number" value={item.unit_cost} min={0}
                  onChange={e=>updateItem(i,'unit_cost',e.target.value)}
                  placeholder="ລາຄາ/ໜ່ວຍ" />
                <button className="btn btn-danger btn-sm" onClick={()=>removeItem(i)}
                  disabled={items.length===1}>✕</button>
              </div>
            ))}

            <button className="btn btn-outline btn-sm" onClick={addItem} style={{ marginBottom:16 }}>
              + ເພີ່ມສິນຄ້າ
            </button>

            <div style={{ background:'#f5f4f0', borderRadius:8, padding:'10px 14px',
              marginBottom:20, display:'flex', justifyContent:'space-between', fontWeight:600 }}>
              <span>ຕົ້ນທຶນລວມ:</span>
              <span style={{ color:'#c0392b', fontFamily:'var(--mono)' }}>{fmt(total)}</span>
            </div>

            <div className="flex gap-2" style={{ justifyContent:'flex-end' }}>
              <button className="btn btn-outline" onClick={()=>setModal(false)}>ຍົກເລີກ</button>
              <button className="btn btn-primary" onClick={save} disabled={busy}>
                {busy ? 'ກຳລັງບັນທຶກ...' : '💾 ບັນທຶກ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth:500 }}>
            <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:4 }}>
              📋 {detail.receipt_number}
            </div>
            <div style={{ fontSize:'.82rem', color:'#706e66', marginBottom:16 }}>
              {new Date(detail.received_at).toLocaleString('lo-LA')} · {detail.employee_name}
            </div>

            <table>
              <thead>
                <tr>
                  <th>ສິນຄ້າ</th>
                  <th className="text-right">ຈຳນວນ</th>
                  <th className="text-right">ລາຄາ/ໜ່ວຍ</th>
                  <th className="text-right">ລວມ</th>
                </tr>
              </thead>
              <tbody>
                {detail.items?.map(item => (
                  <tr key={item.ri_item_id}>
                    <td>{item.product_name}</td>
                    <td className="text-right">{item.qty_received}</td>
                    <td className="text-right mono">{fmt(item.unit_cost)}</td>
                    <td className="text-right mono" style={{ fontWeight:600 }}>{fmt(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign:'right', fontWeight:700, fontSize:'1.05rem',
              marginTop:12, color:'#c0392b' }}>
              ຕົ້ນທຶນລວມ: {fmt(detail.items?.reduce((s,i)=>s+Number(i.subtotal),0))}
            </div>

            {detail.notes && (
              <div style={{ marginTop:10, fontSize:'.85rem', color:'#706e66' }}>
                ໝາຍເຫດ: {detail.notes}
              </div>
            )}

            <div className="flex gap-2 mt-3" style={{ justifyContent:'flex-end' }}>
              <button className="btn btn-outline" onClick={()=>setDetail(null)}>ປິດ</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
