import React, { Suspense, lazy } from "react"
import ReactDOM from "react-dom/client"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import "./index.css"

const App = lazy(() => import("./App.tsx"))

const Loading = () => (
  <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'50vh',fontFamily:'system-ui'}}>
    <div style={{textAlign:'center'}}>
      <div style={{width:36,height:36,border:'3px solid #0f172a',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}></div>
      <p style={{margin:0,fontSize:13,color:'#64748b'}}>جاري التحميل...</p>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
)
