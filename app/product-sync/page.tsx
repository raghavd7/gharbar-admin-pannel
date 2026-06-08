"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Product = any;

export default function ProductSyncPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [imageMap, setImageMap] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, label: "" });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [prodRes, mapRes] = await Promise.all([
        fetch('/api/product-list-api').then(r => r.json()),
        fetch('/api/get-image-map').then(r => r.json()),
      ]);
      setProducts(prodRes.products || []);
      const map: Record<string, any> = {};
      (mapRes.mapped || []).forEach((m:any) => { map[String(m.item_id)] = m; });
      setImageMap(map);
      setErrors({});
      setSelected({});
    } catch (err:any) {
      console.error(err);
      alert('Failed to load data: ' + (err.message || err));
    }
  }

  function getSelectedIds() {
    return Object.keys(selected).filter(id => selected[id]);
  }

  function toggleSelect(id:string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleSelectAll(checked:boolean) {
    const allPending = products;
    const next: Record<string, boolean> = {};
    allPending.forEach(p => { next[String(p.id)] = checked; });
    setSelected(next);
  }

  function getStatus(id:string) {
    if (imageMap[id]) return 'synced';
    if (errors[id]) return 'error';
    return 'pending';
  }

  async function syncOne(id:string) {
    if (isSyncing) return alert('Full sync in progress');
    const p = products.find(pt => String(pt.id) === String(id));
    if (!p) return;
    try {
      const res = await fetch('/api/sync-inventory-images', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ item_id: p.id, name: p.name, sku: p.sku, description: p.description, price: p.price, stock: p.stock, unit: p.unit, item_category: p.item_category })
      });
      const data = await res.json();
      if (data.status === 'success' || data.status === 'already_synced') {
        setImageMap(m => ({ ...m, [String(p.id)]: { file_id: data.file_id, synced: true } }));
        setErrors(e => { const copy = {...e}; delete copy[String(p.id)]; return copy; });
        setSelected(s => { const next = { ...s }; delete next[String(p.id)]; return next; });
      } else {
        setErrors(e => ({ ...e, [String(p.id)]: data.message || 'error' }));
      }
    } catch (err:any) {
      setErrors(e => ({ ...e, [String(p.id)]: err.message || 'request failed' }));
    }
  }

  async function syncSelected() {
    if (isSyncing) return;
    const selectedIds = getSelectedIds();
    if (!selectedIds.length) return alert('No items selected');
    const toSync = products.filter(p => selectedIds.includes(String(p.id)));
    setIsSyncing(true);
    setProgress({ done: 0, total: toSync.length, label: 'Starting' });
    let done = 0;
    for (const p of toSync) {
      setProgress(pr => ({ ...pr, label: `Syncing ${p.name}` }));
      try {
        const res = await fetch('/api/sync-inventory-images', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ item_id: p.id, name: p.name, sku: p.sku, description: p.description, price: p.price, stock: p.stock, unit: p.unit, item_category: p.item_category }) });
        const data = await res.json();
        if (data.status === 'success' || data.status === 'already_synced') {
          setImageMap(m => ({ ...m, [String(p.id)]: { file_id: data.file_id, synced: true } }));
          setErrors(e => { const copy = {...e}; delete copy[String(p.id)]; return copy; });
          setSelected(s => { const next = { ...s }; delete next[String(p.id)]; return next; });
        } else {
          setErrors(e => ({ ...e, [String(p.id)]: data.message || 'error' }));
        }
      } catch (err:any) {
        setErrors(e => ({ ...e, [String(p.id)]: err.message || 'request failed' }));
      }
      done++;
      setProgress({ done, total: toSync.length, label: `Processed ${done} / ${toSync.length}` });
      await new Promise(r => setTimeout(r, 600));
    }
    setIsSyncing(false);
    alert('Sync complete');
  }

  const selectedIds = getSelectedIds();
  const pendingProducts = products.filter(p => !imageMap[String(p.id)]);
  const selectAllChecked = pendingProducts.length > 0 && pendingProducts.every(p => selected[String(p.id)]);
  const selectedCount = selectedIds.length;

  return (
    <div style={{minHeight:'100vh', background:'#0d0f14', color:'#e8eaf0', padding:20, fontFamily:'Sora, IBM Plex Mono, sans-serif'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <div style={{width:32,height:32,borderRadius:8,background:'rgba(74,222,128,0.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>📦</div>
          <div>
            <div style={{fontSize:15,fontWeight:600}}>Inventory Image Sync</div>
            <div style={{fontSize:12,color:'#9ca3af',fontFamily:'IBM Plex Mono'}}>Zoho Inventory → Catalyst</div>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={loadData} disabled={isSyncing} suppressHydrationWarning style={{padding:'8px 12px',borderRadius:8,background:'#1c2029',color:'#e8eaf0'}}>Refresh</button>
          <button onClick={syncSelected} disabled={isSyncing || selectedCount === 0} suppressHydrationWarning style={{padding:'8px 12px',borderRadius:8,background:'#4ade80',color:'#071014',fontWeight:600}}>Sync Selected ({selectedCount})</button>
        </div>
      </header>

      <div style={{marginTop:18}}>
        <Link href="/" style={{color:'#9ca3af', textDecoration:'none'}}>← Back to Admin Home</Link>
      </div>

      <section style={{marginBottom:12}}>
        <div style={{display:'flex',gap:8}}>
          <div style={{background:'#14171e',padding:12,borderRadius:8}}>Total<br/><strong>{products.length}</strong></div>
          <div style={{background:'#14171e',padding:12,borderRadius:8}}>Synced<br/><strong style={{color:'#4ade80'}}>{products.filter(p=> imageMap[String(p.id)]).length}</strong></div>
          <div style={{background:'#14171e',padding:12,borderRadius:8}}>Pending<br/><strong style={{color:'#fbbf24'}}>{products.length - Object.keys(imageMap).length - Object.keys(errors).length}</strong></div>
          <div style={{background:'#14171e',padding:12,borderRadius:8}}>Errors<br/><strong style={{color:'#f87171'}}>{Object.keys(errors).length}</strong></div>
        </div>
      </section>

      <section style={{marginBottom:12}}>
        <div style={{background:'#0f1724',padding:10,borderRadius:8}}>
          <div style={{height:8,background:'#1c2029',borderRadius:99,overflow:'hidden'}}>
            <div style={{height:'100%',width: `${Math.round((progress.done / Math.max(1, progress.total)) * 100)}%`, background:'#4ade80',transition:'width .3s'}} />
          </div>
          <div style={{marginTop:6,color:'#9ca3af',fontFamily:'IBM Plex Mono'}}>{progress.label} {progress.done}/{progress.total}</div>
        </div>
      </section>

      <section>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{textAlign:'left',color:'#9ca3af'}}>
              <th style={{padding:8,width:36}}>
                <input
                  type="checkbox"
                  checked={selectAllChecked}
                  onChange={(event) => toggleSelectAll(event.target.checked)}
                  disabled={isSyncing || pendingProducts.length === 0}
                />
              </th>
              <th style={{padding:8}}>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan={8} style={{padding:20,color:'#9ca3af'}}>Loading…</td></tr>}
            {products.map(p => {
              const id = String(p.id);
              const status = getStatus(id);
              return (
                <tr key={id} style={{borderTop:'1px solid rgba(255,255,255,0.03)'}}>
                  <td style={{padding:10}}>
                    <input
                      type="checkbox"
                      checked={!!selected[id]}
                      onChange={() => toggleSelect(id)}
                      disabled={isSyncing}
                    />
                  </td>
                  <td style={{padding:10}}>{p.name}<div style={{fontFamily:'IBM Plex Mono',color:'#9ca3af',fontSize:12}}>{id}</div></td>
                  <td style={{padding:10}}>{p.sku || '—'}</td>
                  <td style={{padding:10}}>{p.item_category || '—'}</td>
                  <td style={{padding:10}}>₹{p.price ?? 0}</td>
                  <td style={{padding:10}}>{p.stock ?? '—'}</td>
                  <td style={{padding:10}}>
                    {status === 'synced' && <span style={{color:'#4ade80'}}>synced</span>}
                    {status === 'pending' && <span style={{color:'#fbbf24'}}>pending</span>}
                    {status === 'error' && <span style={{color:'#f87171'}}>error</span>}
                  </td>
                  <td style={{padding:10}}>
                    {status === 'synced' ? <span style={{color:'#9ca3af'}}>✓ done</span> : <button disabled={isSyncing} onClick={() => syncOne(id)} style={{padding:'6px 10px',borderRadius:8}}>↑ sync</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
