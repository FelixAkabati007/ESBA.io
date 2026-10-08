#!/usr/bin/env python3
"""Generate tailwind.compiled.css — an exact subset of Tailwind v3.4 utility CSS
for every class used in index.html (static + dynamic), with the app's custom
brand/gold/gh color tokens. Keeps the single-file app offline-capable and
removes the runtime cdn.tailwindcss.com JIT compiler."""
import re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "index.html")
OUT = os.path.join(ROOT, "tailwind.compiled.css")

BRAND = {50:"#f0f6ff",100:"#d9ebff",200:"#bcdcff",300:"#8ec4ff",400:"#59a1ff",
         500:"#337dff",600:"#1a5cf5",700:"#1447d1",800:"#163ba6",900:"#173682",950:"#0f1f4a"}
GOLD  = {300:"#ffd24d",400:"#ffc93c",500:"#f5b301",600:"#d89c00"}
GH    = {"red":"#CE1126","gold":"#FCD116","green":"#006B3F","black":"#000000"}
SLATE = {50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",
         600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}
GRAY  = {50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",
         600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}
EMERALD={50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46"}
ROSE  ={50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239"}
AMBER ={50:"#fffbeb",100:"#fef3c7",200:"#fde68a",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e"}
ORANGE={50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",500:"#f97316",600:"#ea580c",700:"#c2410c"}
BLUE  ={50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a"}
TEAL  ={100:"#ccfbf1",500:"#14b8a6",600:"#0d9488",700:"#0f766e"}
INDIGO={50:"#eef2ff",700:"#4338ca"}; GREEN={50:"#f0fdf4",100:"#dcfce7",500:"#22c55e",700:"#15803d"}
RED   ={50:"#fef2f2",100:"#fee2e2",500:"#ef4444",600:"#dc2626",700:"#b91c1c"}
CYAN={50:"#ecfeff"}; VIOLET={50:"#f5f3ff"}; FUCHSIA={50:"#fdf4ff"}; PINK={50:"#fdf2f8"}; LIME={50:"#f7fee7"}; YELLOW={50:"#fefce8",100:"#fef9c3"}

PALETTES={}
for name,p in [("slate",SLATE),("gray",GRAY),("brand",BRAND),("gold",GOLD),("emerald",EMERALD),
               ("rose",ROSE),("amber",AMBER),("orange",ORANGE),("blue",BLUE),("teal",TEAL),
               ("indigo",INDIGO),("green",GREEN),("red",RED),("cyan",CYAN),("violet",VIOLET),
               ("fuchsia",FUCHSIA),("pink",PINK),("lime",LIME),("yellow",YELLOW)]:
    for k,v in p.items(): PALETTES[f"{name}-{k}"]=v
for k,v in GH.items(): PALETTES[f"gh-{k}"]=v
PALETTES.update({"transparent":"transparent","white":"#ffffff","black":"#000000"})

SPACING={"0":"0px","0.5":"0.125rem","1":"0.25rem","1.5":"0.375rem","2":"0.5rem","2.5":"0.625rem",
         "3":"0.75rem","3.5":"0.875rem","4":"1rem","5":"1.25rem","6":"1.5rem","7":"1.75rem",
         "8":"2rem","9":"2.25rem","10":"2.5rem","11":"2.75rem","12":"3rem","14":"3.5rem",
         "px":"1px","16":"4rem","20":"5rem","24":"6rem","28":"7rem","32":"8rem","36":"9rem",
         "40":"10rem","44":"11rem","48":"12rem","52":"13rem","56":"14rem","60":"15rem","64":"16rem",
         "72":"18rem","80":"20rem","96":"24rem"}
SIZES=dict(SPACING); SIZES.update({"full":"100%","screen":"100vh","min":"min-content",
            "max":"max-content","fit":"fit-content","auto":"auto","3/5":"60%"})
MAXW={"none":"none","xs":"20rem","sm":"24rem","md":"28rem","lg":"32rem","xl":"36rem","2xl":"42rem",
      "3xl":"48rem","4xl":"56rem","5xl":"64rem","prose":"65ch","screen-sm":"640px","screen-md":"768px","screen-lg":"1024px"}
TEXT={"xs":["0.75rem","1rem"],"sm":["0.875rem","1.25rem"],"base":["1rem","1.5rem"],
      "lg":["1.125rem","1.75rem"],"xl":["1.25rem","1.75rem"],"2xl":["1.5rem","2rem"],
      "3xl":["1.875rem","2.25rem"],"4xl":["2.25rem","2.5rem"],"5xl":["3rem","1"]}
WEIGHT={"thin":"100","extralight":"200","light":"300","normal":"400","medium":"500",
        "semibold":"600","bold":"700","extrabold":"800","black":"900"}
ROUND={"none":"0px","sm":"0.125rem","DEFAULT":"0.25rem","md":"0.375rem","lg":"0.5rem",
       "xl":"0.75rem","2xl":"1rem","3xl":"1.5rem","full":"9999px"}
BLUR={"none":"0","sm":"4px","DEFAULT":"8px","md":"12px","lg":"16px","xl":"24px","2xl":"40px","3xl":"64px"}
BREAKPOINTS={"sm":"640px","md":"768px","lg":"1024px","xl":"1280px","2xl":"1536px"}

def hex_rgb(h):
    h=h.lstrip("#")
    if len(h)==3: h="".join(c*2 for c in h)
    return tuple(int(h[i:i+2],16) for i in (0,2,4))
def alpha(v,a):
    if v=="transparent": return "transparent"
    r,g,b=hex_rgb(v); return f"rgba({r}, {g}, {b}, {a})"
def norm_alpha(t):
    t=t.strip()
    return str(int(t)/100) if t.isdigit() else t
def color_part(tok):
    base=tok; a=None
    if "/" in tok: base,a=tok.split("/",1)
    v=PALETTES.get(base)
    if v is None: return None
    return alpha(v,norm_alpha(a)) if a else v

TRANSFORM="transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))"

SIMPLE={
 "flex":"display:flex","inline-flex":"display:inline-flex","grid":"display:grid",
 "block":"display:block","inline-block":"display:inline-block","hidden":"display:none",
 "contents":"display:contents","table":"display:table","flow-root":"display:flow-root",
 "flex-col":"flex-direction:column","flex-row":"flex-direction:row",
 "flex-col-reverse":"flex-direction:column-reverse","flex-row-reverse":"flex-direction:row-reverse",
 "flex-wrap":"flex-wrap:wrap","flex-nowrap":"flex-wrap:nowrap",
 "flex-1":"flex:1 1 0%","flex-auto":"flex:1 1 auto","flex-initial":"flex:0 1 auto","flex-none":"flex:none",
 "shrink":"flex-shrink:1","shrink-0":"flex-shrink:0","grow":"flex-grow:1","grow-0":"flex-grow:0",
 "basis-full":"flex-basis:100%",
 "items-center":"align-items:center","items-start":"align-items:flex-start","items-end":"align-items:flex-end",
 "items-baseline":"align-items:baseline","items-stretch":"align-items:stretch",
 "content-center":"align-content:center","place-items-center":"place-items:center",
 "justify-center":"justify-content:center","justify-between":"justify-content:space-between",
 "justify-end":"justify-content:flex-end","justify-start":"justify-content:flex-start",
 "justify-around":"justify-content:space-around",
 "self-start":"align-self:flex-start","self-end":"align-self:flex-end","self-center":"align-self:center",
 "text-left":"text-align:left","text-center":"text-align:center","text-right":"text-align:right",
 "uppercase":"text-transform:uppercase","lowercase":"text-transform:lowercase","capitalize":"text-transform:capitalize",
 "italic":"font-style:italic","not-italic":"font-style:normal",
 "underline":"text-decoration-line:underline","line-through":"text-decoration-line:line-through",
 "no-underline":"text-decoration-line:none",
 "truncate":"overflow:hidden;text-overflow:ellipsis;white-space:nowrap",
 "whitespace-nowrap":"white-space:nowrap","whitespace-normal":"white-space:normal","whitespace-pre-line":"white-space:pre-line",
 "break-words":"overflow-wrap:break-word","break-all":"word-break:break-all",
 "rounded":"border-radius:0.25rem","rounded-none":"border-radius:0px","rounded-sm":"border-radius:0.125rem",
 "rounded-md":"border-radius:0.375rem","rounded-lg":"border-radius:0.5rem","rounded-xl":"border-radius:0.75rem",
 "rounded-2xl":"border-radius:1rem","rounded-3xl":"border-radius:1.5rem","rounded-full":"border-radius:9999px",
 "rounded-t-xl":"border-top-left-radius:0.75rem;border-top-right-radius:0.75rem",
 "rounded-b-xl":"border-bottom-left-radius:0.75rem;border-bottom-right-radius:0.75rem",
 "rounded-l-lg":"border-top-left-radius:0.5rem;border-bottom-left-radius:0.5rem",
 "border":"border-width:1px","border-0":"border-width:0px","border-2":"border-width:2px","border-4":"border-width:4px",
 "border-t":"border-top-width:1px","border-b":"border-bottom-width:1px","border-l":"border-left-width:1px","border-r":"border-right-width:1px",
 "border-l-4":"border-left-width:4px","border-t-0":"border-top-width:0px","border-b-0":"border-bottom-width:0px",
 "border-dashed":"border-style:dashed","border-solid":"border-style:solid",
 "relative":"position:relative","absolute":"position:absolute","fixed":"position:fixed",
 "sticky":"position:sticky","static":"position:static",
 "inset-0":"inset:0px","inset-x-0":"left:0px;right:0px","inset-y-0":"top:0px;bottom:0px",
 "top-0":"top:0px","right-0":"right:0px","bottom-0":"bottom:0px","left-0":"left:0px",
 "z-0":"z-index:0","z-10":"z-index:10","z-20":"z-index:20","z-30":"z-index:30","z-40":"z-index:40","z-50":"z-index:50",
 "overflow-hidden":"overflow:hidden","overflow-auto":"overflow:auto","overflow-scroll":"overflow:scroll",
 "overflow-visible":"overflow:visible",
 "overflow-x-auto":"overflow-x:auto","overflow-y-auto":"overflow-y:auto","overflow-x-hidden":"overflow-x:hidden",
 "overflow-y-hidden":"overflow-y:hidden","overflow-y-scroll":"overflow-y:scroll","overflow-x-scroll":"overflow-x:scroll",
 "opacity-0":"opacity:0","opacity-10":"opacity:0.1","opacity-20":"opacity:0.2","opacity-30":"opacity:0.3",
 "opacity-40":"opacity:0.4","opacity-50":"opacity:0.5","opacity-60":"opacity:0.6","opacity-70":"opacity:0.7",
 "opacity-75":"opacity:0.75","opacity-80":"opacity:0.8","opacity-90":"opacity:0.9","opacity-100":"opacity:1",
 "cursor-pointer":"cursor:pointer","cursor-not-allowed":"cursor:not-allowed","cursor-default":"cursor:default",
 "cursor-wait":"cursor:wait","cursor-move":"cursor:move","cursor-grab":"cursor:grab",
 "select-none":"user-select:none","select-text":"user-select:text","select-all":"user-select:all",
 "resize-none":"resize:none","resize":"resize:both",
 "sr-only":"position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0",
 "not-sr-only":"position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip:auto;white-space:normal",
 "object-cover":"object-fit:cover","object-contain":"object-fit:contain","object-center":"object-position:center",
 "transition":"transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
 "transition-all":"transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
 "transition-colors":"transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
 "transition-transform":"transition-property:transform;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
 "duration-100":"transition-duration:100ms","duration-150":"transition-duration:150ms","duration-200":"transition-duration:200ms",
 "duration-300":"transition-duration:300ms","duration-500":"transition-duration:500ms","duration-700":"transition-duration:700ms","duration-1000":"transition-duration:1000ms",
 "ease-out":"transition-timing-function:cubic-bezier(0,0,0.2,1)","ease-in":"transition-timing-function:cubic-bezier(0.4,0,1,1)",
 "ease-in-out":"transition-timing-function:cubic-bezier(0.4,0,0.2,1)",
 "animate-pulse":"animation:twPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
 "animate-spin":"animation:twSpin 1s linear infinite",
 "animate-bounce":"animation:twBounce 1s infinite",
 "shadow-sm":"box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05)",
 "shadow":"box-shadow:0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
 "shadow-md":"box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
 "shadow-lg":"box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
 "shadow-xl":"box-shadow:0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
 "shadow-2xl":"box-shadow:0 25px 50px -12px rgb(0 0 0 / 0.25)",
 "shadow-none":"box-shadow:0 0 #0000",
 "blur":"filter:blur(8px)","blur-sm":"filter:blur(4px)","blur-md":"filter:blur(12px)","blur-lg":"filter:blur(16px)",
 "blur-xl":"filter:blur(24px)","blur-2xl":"filter:blur(40px)","blur-3xl":"filter:blur(64px)","blur-none":"filter:blur(0)",
 "backdrop-blur":"--tw-backdrop-blur:blur(8px);-webkit-backdrop-filter:var(--tw-backdrop-blur);backdrop-filter:var(--tw-backdrop-blur)",
 "backdrop-blur-sm":"--tw-backdrop-blur:blur(4px);-webkit-backdrop-filter:var(--tw-backdrop-blur);backdrop-filter:var(--tw-backdrop-blur)",
 "bg-gradient-to-br":"background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))",
 "bg-gradient-to-b":"background-image:linear-gradient(to bottom,var(--tw-gradient-stops))",
 "bg-gradient-to-r":"background-image:linear-gradient(to right,var(--tw-gradient-stops))",
 "bg-gradient-to-t":"background-image:linear-gradient(to top,var(--tw-gradient-stops))",
 "bg-gradient-to-tr":"background-image:linear-gradient(to top right,var(--tw-gradient-stops))",
 "bg-no-repeat":"background-repeat:no-repeat","bg-center":"background-position:center","bg-cover":"background-size:cover",
 "leading-none":"line-height:1","leading-tight":"line-height:1.25","leading-snug":"line-height:1.375",
 "leading-normal":"line-height:1.5","leading-relaxed":"line-height:1.625","leading-loose":"line-height:2",
 "leading-5":"line-height:1.25rem",
 "tracking-tighter":"letter-spacing:-0.05em","tracking-tight":"letter-spacing:-0.025em","tracking-normal":"letter-spacing:0",
 "tracking-wide":"letter-spacing:0.025em","tracking-wider":"letter-spacing:0.05em","tracking-widest":"letter-spacing:0.1em",
 "ring-0":"box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)",
 "ring-1":"--tw-ring-shadow:0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)",
 "ring-2":"--tw-ring-shadow:0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)",
 "ring-4":"--tw-ring-shadow:0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)",
 "outline-none":"outline:2px solid transparent;outline-offset:2px",
 "min-w-0":"min-width:0px","min-w-full":"min-width:100%","min-h-screen":"min-height:100vh","min-h-full":"min-height:100%",
 "h-full":"height:100%","h-screen":"height:100vh","w-full":"width:100%","w-screen":"width:100vw","h-auto":"height:auto","w-auto":"width:auto",
 "h-px":"height:1px","w-px":"width:1px",
 "max-w-none":"max-width:none","max-w-full":"max-width:100%","max-h-full":"max-height:100%","max-h-screen":"max-height:100vh",
 "grid-flow-row":"grid-auto-flow:row","grid-flow-col":"grid-auto-flow:column",
 "col-span-full":"grid-column:1/-1",
 "pointer-events-none":"pointer-events:none","pointer-events-auto":"pointer-events:auto",
 "list-none":"list-style:none","list-disc":"list-style-type:disc",
 "antialiased":"-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale",
 "-translate-x-full":"--tw-translate-x:-100%;"+TRANSFORM,
 "-translate-y-full":"--tw-translate-y:-100%;"+TRANSFORM,
 "translate-x-0":"--tw-translate-x:0px;"+TRANSFORM,"translate-y-0":"--tw-translate-y:0px;"+TRANSFORM,
 "translate-x-full":"--tw-translate-x:100%;"+TRANSFORM,
 "scale-95":"--tw-scale-x:.95;--tw-scale-y:.95;"+TRANSFORM,"scale-100":"--tw-scale-x:1;--tw-scale-y:1;"+TRANSFORM,
 "scale-105":"--tw-scale-x:1.05;--tw-scale-y:1.05;"+TRANSFORM,"scale-110":"--tw-scale-x:1.1;--tw-scale-y:1.1;"+TRANSFORM,
 "visible":"visibility:visible","invisible":"visibility:hidden",
 "isolate":"isolation:isolate","float-left":"float:left","float-right":"float:right","clear-both":"clear:both",
 "font-mono":"font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace",
 "font-sans":"font-family:Inter,ui-sans-serif,system-ui,sans-serif",
}

def gen_base(cls):
    c=cls
    if c.startswith("!"):
        return _gen(c[1:], imp=True)
    return _gen(c)

def _gen_raw(c):
    if (m:=re.fullmatch(r"max-w-\[(.+)\]",c)): return f"max-width:{m.group(1).replace('_',' ')}"
    if (m:=re.fullmatch(r"max-h-\[(.+)\]",c)): return f"max-height:{m.group(1).replace('_',' ')}"
    if (m:=re.fullmatch(r"min-h-\[(.+)\]",c)): return f"min-height:{m.group(1).replace('_',' ')}"
    if (m:=re.fullmatch(r"w-\[(.+)\]",c)):     return f"width:{m.group(1).replace('_',' ')}"
    if (m:=re.fullmatch(r"h-\[(.+)\]",c)):     return f"height:{m.group(1).replace('_',' ')}"
    if (m:=re.fullmatch(r"shadow-\[(.+)\]",c)):return f"box-shadow:{m.group(1).replace('_',' ')}"
    if (m:=re.fullmatch(r"grid-cols-\[(.+)\]",c)): return f"grid-template-columns:{m.group(1).replace('_',' ')}"
    if (m:=re.fullmatch(r"text-\[(.+)\]",c)):
        v=m.group(1)
        if "/" in v: fs,lh=v.split("/"); return f"font-size:{fs};line-height:{lh}"
        return f"font-size:{v}"
    if (m:=re.fullmatch(r"tracking-\[(.+)\]",c)): return f"letter-spacing:{m.group(1)}"
    if (m:=re.fullmatch(r"top-\[(.+)\]",c)): return f"top:{m.group(1)}"
    if (m:=re.fullmatch(r"bg-\[#([0-9a-fA-F]{3,6})(?:/(\d+))?\]",c)):
        col="#"+m.group(1); return f"background-color:{alpha(col,m.group(2)) if m.group(2) else col}"
    if (m:=re.fullmatch(r"bg-\[linear-gradient\((.+)\)\]",c)):
        return f"background-image:linear-gradient({m.group(1).replace('_',' ')})"
    # spacing families (longer prefixes first)
    for pre,props in [("gap-x",["column-gap"]),("gap-y",["row-gap"]),
                      ("px",["padding-left","padding-right"]),("py",["padding-top","padding-bottom"]),
                      ("mx",["margin-left","margin-right"]),("my",["margin-top","margin-bottom"]),
                      ("pt",["padding-top"]),("pb",["padding-bottom"]),("pl",["padding-left"]),("pr",["padding-right"]),
                      ("mt",["margin-top"]),("mb",["margin-bottom"]),("ml",["margin-left"]),("mr",["margin-right"]),
                      ("top",["top"]),("right",["right"]),("bottom",["bottom"]),("left",["left"]),
                      ("gap",["gap"]),("p",["padding"]),("m",["margin"])]:
        pref=pre+"-"
        if c.startswith(pref):
            tok=c[len(pref):]
            if tok=="auto" and props[0].startswith("margin"): return ";".join(f"{p}:auto" for p in props)
            v=SPACING.get(tok)
            if v is None and tok in SIZES and pre in ("top","right","bottom","left"):
                v=SIZES[tok]
                if tok=="screen": v="100vh" if pre in ("top","bottom") else "100vw"
                if tok=="full": v="100%"
            if v is None: continue
            return ";".join(f"{p}:{v}" for p in props)
    if (m:=re.fullmatch(r"space-y-(\S+)",c)):
        v=SPACING.get(m.group(1));  return f"__SPACEY__{v}" if v else None
    if (m:=re.fullmatch(r"space-x-(\S+)",c)):
        v=SPACING.get(m.group(1));  return f"__SPACEX__{v}" if v else None
    if (m:=re.fullmatch(r"divide-y(?:-(\d+))?",c)): return "__DIVIDAY__"+(m.group(1) or "1")
    if (m:=re.fullmatch(r"divide-x(?:-(\d+))?",c)): return "__DIVIDAX__"+(m.group(1) or "1")
    if c in SIMPLE: return SIMPLE[c]
    if (m:=re.fullmatch(r"h-(\S+)",c)) and m.group(1) in SIZES:
        v=SIZES[m.group(1)]
        if m.group(1)=="screen": v="100vh"
        return f"height:{v}"
    if (m:=re.fullmatch(r"min-h-(\S+)",c)) and m.group(1) in SIZES: return f"min-height:{SIZES[m.group(1)]}"
    if (m:=re.fullmatch(r"max-h-(\S+)",c)) and m.group(1) in SIZES: return f"max-height:{SIZES[m.group(1)]}"
    if (m:=re.fullmatch(r"w-(\S+)",c)) and m.group(1) in SIZES:
        v=SIZES[m.group(1)]
        if m.group(1)=="screen": v="100vw"
        return f"width:{v}"
    if (m:=re.fullmatch(r"min-w-(\S+)",c)) and m.group(1) in SIZES: return f"min-width:{SIZES[m.group(1)]}"
    if (m:=re.fullmatch(r"max-w-(\S+)",c)) and m.group(1) in MAXW: return f"max-width:{MAXW[m.group(1)]}"
    if (m:=re.fullmatch(r"grid-cols-(\d+)",c)): return f"grid-template-columns:repeat({m.group(1)},minmax(0,1fr))"
    if (m:=re.fullmatch(r"grid-rows-(\d+)",c)): return f"grid-template-rows:repeat({m.group(1)},minmax(0,1fr))"
    if (m:=re.fullmatch(r"col-span-(\d+)",c)): return f"grid-column:span {m.group(1)} / span {m.group(1)}"
    if (m:=re.fullmatch(r"row-span-(\d+)",c)): return f"grid-row:span {m.group(1)} / span {m.group(1)}"
    if (m:=re.fullmatch(r"order-(\S+)",c)):
        t=m.group(1)
        if t=="first": return "order:-9999"
        if t=="last": return "order:9999"
        if t=="none": return "order:0"
        try: return f"order:{int(t)}"
        except ValueError: return None
    if (m:=re.fullmatch(r"rounded-(\S+)",c)) and m.group(1) in ROUND: return f"border-radius:{ROUND[m.group(1)]}"
    if (m:=re.fullmatch(r"border-(\S+)",c)):
        t=m.group(1)
        if t.isdigit(): return f"border-width:{t}px"
        col=color_part(t)
        if col: return f"border-color:{col}"
    if (m:=re.fullmatch(r"bg-(\S+)",c)):
        col=color_part(m.group(1))
        if col: return f"background-color:{col}"
    if (m:=re.fullmatch(r"text-(\S+)",c)):
        t=m.group(1)
        if t in TEXT: fs,lh=TEXT[t]; return f"font-size:{fs};line-height:{lh}"
        if t in WEIGHT: return f"font-weight:{WEIGHT[t]}"
        col=color_part(t)
        if col: return f"color:{col}"
    if (m:=re.fullmatch(r"from-(\S+)",c)):
        col=color_part(m.group(1))
        if col: return f"--tw-gradient-from:{col} var(--tw-gradient-from-position);--tw-gradient-to:rgb(255 255 255 / 0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)"
    if (m:=re.fullmatch(r"via-(\S+)",c)):
        col=color_part(m.group(1))
        if col: return "--tw-gradient-to:rgb(255 255 255 / 0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),"+f"{col} var(--tw-gradient-via-position),var(--tw-gradient-to)"
    if (m:=re.fullmatch(r"to-(\S+)",c)):
        col=color_part(m.group(1))
        if col: return f"--tw-gradient-to:{col} var(--tw-gradient-to-position)"
    if (m:=re.fullmatch(r"ring-(\S+)",c)):
        col=color_part(m.group(1))
        if col: return f"--tw-ring-color:{col}"
    if (m:=re.fullmatch(r"accent-(\S+)",c)):
        col=color_part(m.group(1))
        if col: return f"accent-color:{col}"
    if (m:=re.fullmatch(r"blur-(\S+)",c)) and m.group(1) in BLUR: return f"filter:blur({BLUR[m.group(1)]})"
    if (m:=re.fullmatch(r"-?(top|right|bottom|left)-(\S+)",c)):
        side,tok=neg=None,None
        neg=c.startswith("-"); side=m.group(1); tok=m.group(2)
        v=SPACING.get(tok)
        if v: return f"{side}:{'-'+v if neg and v!='0px' else v}"
    if (m:=re.fullmatch(r"aspect-(\S+)",c)):
        t=m.group(1)
        if t=="square": return "aspect-ratio:1/1"
        if t=="video": return "aspect-ratio:16/9"
        if ":" in t: return f"aspect-ratio:{t.replace(':','/')}"
    if (m:=re.fullmatch(r"basis-(\S+)",c)) and m.group(1) in SIZES: return f"flex-basis:{SIZES[m.group(1)]}"
    if (m:=re.fullmatch(r"leading-(\S+)",c)):
        t=m.group(1)
        if t in SPACING: return f"line-height:{SPACING[t]}"
        if re.fullmatch(r"\d+(\.\d+)?",t): return f"line-height:{t}"
    if (m:=re.fullmatch(r"-translate-x-(\S+)",c)):
        v={"full":"-100%","1/2":"-50%"}.get(m.group(1))
        if v: return f"--tw-translate-x:{v};{TRANSFORM}"
    if (m:=re.fullmatch(r"-translate-y-(\S+)",c)):
        v={"full":"-100%","1/2":"-50%"}.get(m.group(1))
        if v: return f"--tw-translate-y:{v};{TRANSFORM}"
    if (m:=re.fullmatch(r"translate-x-(\S+)",c)):
        v={"full":"100%","1/2":"50%","0":"0px"}.get(m.group(1))
        if v: return f"--tw-translate-x:{v};{TRANSFORM}"
    if (m:=re.fullmatch(r"translate-y-(\S+)",c)):
        v={"full":"100%","1/2":"50%","0":"0px"}.get(m.group(1))
        if v: return f"--tw-translate-y:{v};{TRANSFORM}"
    if (m:=re.fullmatch(r"rotate-(-?\d+)",c)): return f"--tw-rotate:{m.group(1)}deg;{TRANSFORM}"
    if (m:=re.fullmatch(r"scale-(\d+)",c)):
        s=int(m.group(1))/100; return f"--tw-scale-x:{s};--tw-scale-y:{s};{TRANSFORM}"
    return None

def _gen(c, imp=False):
    d=_gen_raw(c)
    if d is None or not imp: return d
    parts=[]
    depth=0; cur=""
    for ch in d:
        if ch=="(" : depth+=1
        if ch==")" : depth-=1
        if ch==";" and depth==0:
            parts.append(cur); cur=""
        else: cur+=ch
    if cur: parts.append(cur)
    out=[]
    for pdecl in parts:
        if pdecl.strip().startswith("--tw-") or "box-shadow:" in pdecl or "transform:" in pdecl or "filter:" in pdecl or "backdrop-filter" in pdecl or "animation:" in pdecl or "transition" in pdecl or "outline:" in pdecl:
            out.append(pdecl+" !important")
        else:
            out.append(pdecl+" !important")
    return ";".join(out)

def esc(s):
    out=""
    for ch in s:
        if ch in ' .!\"#$%&\'()*+,/:;<=>?@[\\]^`{|}~': out+="\\"+ch
        else: out+=ch
    return out

CUSTOM_TOKEN=re.compile(r"^[a-z][a-z0-9-]*$")  # non-utility custom classes are fine to skip

def collect_classes():
    text=open(SRC,encoding="utf-8").read()
    toks=set()
    for attr in re.findall(r'class="([^"]*)"',text)+re.findall(r"class='([^']*)'",text):
        for t in attr.split():
            if "$" in t or "{" in t or "}" in t: continue
            toks.add(t)
    for pool in [
      "bg-emerald-100 text-emerald-700 bg-amber-100 text-amber-700 bg-orange-100 text-orange-700",
      "bg-rose-100 text-rose-700 bg-slate-200 text-slate-700 bg-slate-200 text-slate-600",
      "bg-brand-100 text-brand-700 bg-slate-100 text-slate-600 bg-gh-green/15 text-gh-green",
      "bg-emerald-500 bg-amber-500 bg-orange-500 bg-rose-500 bg-brand-500 bg-brand-600 bg-slate-200",
      "from-brand-600 to-brand-800 from-gh-green to-emerald-700 from-gold-500 to-amber-600",
      "from-gh-red to-rose-700 from-slate-600 to-slate-800 from-brand-500 from-brand-950/75 from-brand-950/95 via-brand-900/35 via-brand-950/60 to-brand-800 to-transparent",
      "text-amber-800 border-brand-600 bg-brand-50 ring-2 ring-gold-500/50",
      "bg-slate-50 text-slate-500 hidden active is-selected surface-light surface-dark hover:bg-brand-600",
      "bg-white/95 backdrop-blur text-gold-500 text-white/70 hover:text-white focus:ring-2 focus:border-brand-600",
      "text-brand-700 text-gh-red text-gh-green bg-rose-50 bg-emerald-50 bg-amber-50 bg-brand-950/60 bg-slate-950/40",
      "hover:bg-brand-50 hover:bg-rose-50 hover:bg-slate-50 hover:bg-slate-100 hover:border-brand-600 hover:text-brand-700 hover:text-gh-red hover:text-white hover:underline",
      "disabled:cursor-not-allowed disabled:opacity-50 sm:flex sm:flex-row sm:justify-end sm:justify-between",
    ]:
        for t in pool.split(): toks.add(t)
    # quoted utility strings anywhere (JS maps/toggles) — only keep those that generate CSS
    for t in re.findall(r'"([a-zA-Z_-][a-zA-Z0-9./%\[\]()#:_-]*)"',text):
        if " " in t or t.count(":")>2: continue
        last=t.split(":")[-1]
        if not last: continue
        if gen_base(last) is not None:
            toks.add(t)
    return toks

def main():
    toks=collect_classes()
    # tokens that actually appear in class attributes (static + template literals)
    html_text=open(SRC,encoding="utf-8").read()
    attr_tokens=set()
    for attr in re.findall(r'class="([^"]*)"',html_text)+re.findall(r"class='([^']*)'",html_text):
        for t in attr.split():
            if "$" not in t and "{" not in t and "}" not in t:
                attr_tokens.add(t)
    bases=set(); variants={}
    for t in sorted(toks):
        if "[@media(" in t:
            mm=re.search(r"\[@media\((.+?)\)\]:",t)
            if mm:
                variants.setdefault(mm.group(0),set()).add(t)
                continue
        parts=t.split(":")
        cls=parts[-1]; vs=parts[:-1]
        if vs:
            # variant tokens only when they literally appear in class attributes
            if t in attr_tokens:
                for v in set(vs): variants.setdefault(v,set()).add(t)
        elif "-" in t and ":" in t:
            pass  # JS string that looks like a variant but isn't used as a class token
        else:
            bases.add(cls)
    head="""/* tailwind.compiled.css — generated by tools/build_tailwind_subset.py
   Exact Tailwind v3.4 utility subset for ESBA-GH (offline; replaces cdn.tailwindcss.com JIT). */
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
body{margin:0;line-height:inherit}
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit;margin:0}
p,dl,dd,figure,blockquote,pre{margin:0}
ul,ol{margin:0;padding:0;list-style:none}
a{color:inherit;text-decoration:inherit}
button,input,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}
button,select{text-transform:none}
button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-color:transparent;background-image:none}
:-moz-focusring{outline:auto}
progress{vertical-align:baseline}
img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}
img,video{max-width:100%;height:auto}
table{border-collapse:collapse;border-color:inherit;text-indent:0}
th{text-align:inherit}
summary{display:block}
[hidden]{display:none}
@keyframes twPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes twSpin{to{transform:rotate(360deg)}}
@keyframes twBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-25%)}}
@property --tw-translate-x{syntax:"*";inherits:false;initial-value:0}
@property --tw-translate-y{syntax:"*";inherits:false;initial-value:0}
@property --tw-rotate{syntax:"*";inherits:false}
@property --tw-skew-x{syntax:"*";inherits:false}
@property --tw-skew-y{syntax:"*";inherits:false}
@property --tw-scale-x{syntax:"*";inherits:false;initial-value:1}
@property --tw-scale-y{syntax:"*";inherits:false;initial-value:1}
@property --tw-gradient-from{syntax:"<color>";inherits:false;initial-value:#0000}
@property --tw-gradient-to{syntax:"<color>";inherits:false;initial-value:#0000}
@property --tw-gradient-stops{syntax:"*";inherits:false}
@property --tw-gradient-via-position{syntax:"<length-percentage>";inherits:false;initial-value:50%}
@property --tw-gradient-from-position{syntax:"<length-percentage>";inherits:false;initial-value:0%}
@property --tw-gradient-to-position{syntax:"<length-percentage>";inherits:false;initial-value:100%}
@property --tw-ring-color{syntax:"<color>";inherits:false;initial-value:#3b82f680}
@property --tw-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}
@property --tw-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}
@property --tw-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0}
@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}
@property --tw-backdrop-blur{syntax:"*";inherits:false}
"""
    def rule_for(cls,prefix=""):
        d=gen_base(cls)
        if d is None: return None
        sel=f'{prefix}[class~="{esc(cls)}"]'
        if d.startswith("__SPACEY__"):
            return f'{sel} > * + *{{margin-top:{d.split("__SPACEY__")[1]}}}'
        if d.startswith("__SPACEX__"):
            return f'{sel} > * + *{{margin-left:{d.split("__SPACEX__")[1]}}}'
        if d.startswith("__DIVIDAY__"):
            w=d[len("__DIVIDAY__"):]
            return f'{sel} > :not([hidden]) ~ :not([hidden]){{border-top-width:{w}px;border-bottom-width:0px}}'
        if d.startswith("__DIVIDAX__"):
            w=d[len("__DIVIDAX__"):]
            return f'{sel} > :not([hidden]) ~ :not([hidden]){{border-left-width:{w}px;border-right-width:0px}}'
        return f"{sel}{{{d}}}"
    def divide_color_rule(cls,prefix=""):
        m=re.fullmatch(r"divide-([a-zA-Z]+-?\d*(?:/\d+)?)",cls)
        if not m: return None
        col=color_part(m.group(1))
        if not col: return None
        return f'{prefix}[class~="{esc(cls)}"] > :not([hidden]) ~ :not([hidden]){{border-color:{col}}}'
    def full_token_selector(tok):
        """Selector matching the literal variant token in class attribute."""
        return f'[class~="{esc(tok)}"]'
    lines=[head]
    emitted=set(); skipped=[]
    for cls in sorted(bases):
        r=rule_for(cls) or divide_color_rule(cls)
        if r: lines.append(r); emitted.add(cls)
        elif any(ch.isdigit() for ch in cls) and "-" in cls and re.match(r"^(sm|md|lg|xl|2xl|hover|focus)",cls) is None:
            skipped.append(cls)
    order=["hover","focus","focus-visible","active","disabled","group-hover","peer-checked","first","last","odd","even","placeholder","motion-safe","motion-reduce","sm","md","lg","xl","2xl"]
    def variant_block(v):
        pseudo=None; media=None
        if v=="hover": pseudo=":hover"
        elif v=="focus": pseudo=":focus"
        elif v=="focus-visible": pseudo=":focus-visible"
        elif v=="active": pseudo=":active"
        elif v=="disabled": pseudo=":disabled"
        elif v=="first": pseudo=":first-child"
        elif v=="last": pseudo=":last-child"
        elif v=="odd": pseudo=":nth-child(odd)"
        elif v=="even": pseudo=":nth-child(even)"
        elif v=="placeholder": pseudo="::placeholder"
        elif v=="group-hover": pass
        elif v=="peer-checked": pass
        elif v=="motion-safe": media="(prefers-reduced-motion: no-preference)"
        elif v=="motion-reduce": media="(prefers-reduced-motion: reduce)"
        elif v in BREAKPOINTS: media=f"(min-width:{BREAKPOINTS[v]})"
        elif "[@media(" in v and v.endswith("]") and ":grid" not in v or v.startswith("[@media"):
            mm=re.search(r"\[@media\((.+?)\)\]",v)
            if not mm: return []
            media=f"({mm.group(1)})" if ":" in mm.group(1) and not mm.group(1).startswith("(") else mm.group(1)
        else:
            return []
        rules=[]
        for tok in sorted(variants[v]):
            if v.startswith("[@media"):
                cls=tok.rsplit("]",1)[-1].lstrip(":")
            else:
                cls=tok.split(":")[-1]
            # match the FULL literal token (e.g. "hover:bg-brand-50") in class attr
            base_sel=full_token_selector(tok)
            d=gen_base(cls)
            if d is not None:
                if d.startswith("__SPACEY__"):
                    r=f'{base_sel} > * + *{{margin-top:{d.split("__SPACEY__")[1]}}}'
                elif d.startswith("__SPACEX__"):
                    r=f'{base_sel} > * + *{{margin-left:{d.split("__SPACEX__")[1]}}}'
                elif d.startswith("__DIVID"):
                    continue
                else:
                    r=f"{base_sel}{{{d}}}"
            else:
                r=divide_color_rule(cls)
                if r: r=r.replace(f'[class~="{esc(cls)}"]',base_sel,1)
            if not r: continue
            idx=r.index("{")
            selpart=r[:idx]; body=r[idx:]
            if pseudo:
                if "> * + *" in selpart or "~ :not([hidden])" in selpart:
                    parent=selpart.split(">")[0].split("~")[0].rstrip()
                    rest=selpart[len(parent):].lstrip()
                    r=f"{parent}{pseudo} {rest}{body}"
                else:
                    r=selpart+pseudo+body
            if v=="group-hover":
                r=".group:hover "+r
            if v=="peer-checked":
                r=".peer:checked ~ "+r
            rules.append(r)
        blob="\n".join(rules)
        if media: return [f"@media {media} {{\n{blob}\n}}"]
        return rules
    for v in sorted(variants,key=lambda x:(order.index(x) if x in order else 50)):
        lines.extend(variant_block(v))
    open(OUT,"w",encoding="utf-8").write("\n".join(lines)+"\n")
    print(f"emitted {len(emitted)} base utilities, {len(variants)} variant groups -> {OUT}")
    su=sorted(set(skipped))
    if su: print("NOTE numeric-looking classes not emitted (verify these are custom):",su[:60])

if __name__=="__main__":
    main()
