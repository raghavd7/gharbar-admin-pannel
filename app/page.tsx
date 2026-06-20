import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div style={{minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#0d0f14', color: '#e8eaf0', padding: 28}}>
      <main style={{maxWidth: 1100, margin: '0 auto'}}>
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22}}>
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <div style={{width:32,height:32, borderRadius:8, background: 'rgba(74,222,128,0.12)', display:'flex', alignItems:'center', justifyContent:'center'}}>📦</div>
            <div>
              <div style={{fontSize:16, fontWeight:600}}>Gharbar Admin</div>
              <div style={{fontSize:12, color:'#9ca3af'}}>Inventory Sync Dashboard</div>
            </div>
          </div>
        </header>

        {/* <section style={{display:'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 18}}>
          <div style={{background:'#14171e', padding:12, borderRadius:8}}>Total Items<br/><strong id="statTotal">—</strong></div>
          <div style={{background:'#14171e', padding:12, borderRadius:8}}>Synced<br/><strong id="statSynced" style={{color:'#4ade80'}}>—</strong></div>
          <div style={{background:'#14171e', padding:12, borderRadius:8}}>Pending<br/><strong id="statPending" style={{color:'#fbbf24'}}>—</strong></div>
          <div style={{background:'#14171e', padding:12, borderRadius:8}}>Errors<br/><strong id="statErrors" style={{color:'#f87171'}}>—</strong></div>
        </section> */}

        <nav style={{display: 'flex', gap: 12, marginBottom: 18}}>
          <Link href="/product-sync" style={{padding:'8px 12px', background:'#4ade80', color:'#071014', borderRadius:8, fontWeight:600, display:'inline-flex', alignItems:'center', textDecoration:'none'}}>Open Product Image Sync</Link>
          <Link href="/customers" style={{padding:'8px 12px', background:'#60a5fa', color:'#071014', borderRadius:8, fontWeight:600, display:'inline-flex', alignItems:'center', textDecoration:'none'}}>Open Customers</Link>
        </nav>

        <p style={{color:'#9ca3af'}}>Use the Product Sync page to synchronize inventory images from Zoho Inventory into Catalyst file store and reduce load on Inventory APIs.</p>
      </main>
    </div>
  );
}
