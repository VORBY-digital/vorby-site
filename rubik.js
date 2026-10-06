/*
 * Настоящая геометрия кубика 3 × 3 на WebGL, без Three.js и загрузки моделей.
 * 26 кубиков, 54 цветные накладки, скруглённые края и направленное освещение.
 * Каждый поворот переставляет детали. Сборка — обратные ходы перемешивания.
 */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const identity = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  function multiply(a,b,result=new Float32Array(16)) {
    for (let col=0;col<4;col++) for (let row=0;row<4;row++) {
      result[col*4+row] = a[row]*b[col*4]+a[4+row]*b[col*4+1]+a[8+row]*b[col*4+2]+a[12+row]*b[col*4+3];
    }
    return result;
  }
  function rotation(axis,angle,out=new Float32Array(16)) {
    const c=Math.cos(angle), s=Math.sin(angle);
    out.fill(0);out[15]=1;
    if (axis===0) {out[0]=1;out[5]=c;out[6]=s;out[9]=-s;out[10]=c;}
    else if (axis===1) {out[0]=c;out[2]=-s;out[5]=1;out[8]=s;out[10]=c;}
    else {out[0]=c;out[1]=s;out[4]=-s;out[5]=c;out[10]=1;}
    return out;
  }
  function translation(x,y,z,m=identity()) {m.fill(0);m[0]=m[5]=m[10]=m[15]=1;m[12]=x;m[13]=y;m[14]=z;return m;}
  function transformPoint(m,p) {
    return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
  }
  function perspective(fov,aspect,near,far,out=new Float32Array(16)) {
    const f=1/Math.tan(fov/2), range=1/(near-far);
    out.fill(0);out[0]=f/aspect;out[5]=f;out[10]=(far+near)*range;out[11]=-1;out[14]=2*far*near*range;return out;
  }
  const inverseMoves = moves => moves.slice().reverse().map(move => ({...move,direction:-move.direction}));
  const SCRAMBLE = [
    {axis:0,layer:1,direction:1}, {axis:1,layer:1,direction:-1},
    {axis:2,layer:1,direction:1}, {axis:0,layer:-1,direction:-1},
    {axis:1,layer:-1,direction:1}, {axis:2,layer:-1,direction:-1},
    {axis:0,layer:1,direction:-1}, {axis:1,layer:1,direction:1},
    {axis:2,layer:1,direction:-1}, {axis:0,layer:-1,direction:1}
  ];

  class CubeState {
    constructor() {
      this.cubies=[];
      for (let x=-1;x<=1;x++) for (let y=-1;y<=1;y++) for (let z=-1;z<=1;z++) {
        if (x===0&&y===0&&z===0) continue;
        this.cubies.push({home:[x,y,z],position:[x,y,z],orientation:identity()});
      }
    }
    turn(move) {
      const matrix=rotation(move.axis,move.direction*Math.PI/2);
      this.cubies.filter(cubie=>cubie.position[move.axis]===move.layer).forEach(cubie=>{
        cubie.position=transformPoint(matrix,cubie.position).map(Math.round);
        cubie.orientation=multiply(matrix,cubie.orientation).map(Math.round);
      });
    }
    reset() {this.cubies.forEach(cubie=>{cubie.position=cubie.home.slice(); cubie.orientation=identity();});}
    isSolved() {
      return this.cubies.every(cubie=>cubie.position.every((n,i)=>n===cubie.home[i])&&cubie.orientation.every((n,i)=>n===(i%5===0?1:0)));
    }
  }

  // Один раз вычисляем все законченные ходы. Между ними меняется только угол слоя.
  function solveSnapshots() {
    const state=new CubeState(), snapshots=[];
    SCRAMBLE.forEach(move=>state.turn(move));
    const save=()=>snapshots.push(state.cubies.map(cubie=>({position:cubie.position.slice(),orientation:new Float32Array(cubie.orientation)})));
    save();inverseMoves(SCRAMBLE).forEach(move=>{state.turn(move);save();});
    return snapshots;
  }
  function restoreSnapshot(cube,snapshot) {
    cube.cubies.forEach((cubie,i)=>{for(let axis=0;axis<3;axis++)cubie.position[axis]=snapshot[i].position[axis];cubie.orientation.set(snapshot[i].orientation);});
  }
  function packMeshData(meshes) {
    const data=new Float32Array(meshes.reduce((sum,mesh)=>sum+mesh.length,0)),offsets=[];
    let offset=0;
    for(const mesh of meshes){offsets.push(offset/9);data.set(mesh,offset);offset+=mesh.length;}
    return {data,offsets};
  }

  // Модели и промежуточные матрицы выделяются один раз, а не на каждом кадре.
  function createModelBuffers(count) {
    const data=new Float32Array(count*16);
    return {data,models:Array.from({length:count},(_,i)=>data.subarray(i*16,i*16+16)),
      x:identity(),y:identity(),z:identity(),translation:identity(),global:identity(),
      rotation:identity(),layer:identity(),local:identity(),extra:identity(),turned:identity()};
  }
  function writeCubeModels(cubies,pose,buffers) {
    const {mobileAuto,navCube,cinematic,reduced,elapsed,scrollProgress,pageProgress,tiltX,tiltY,active}=pose;
    const b=buffers;
    const yaw=mobileAuto?-.62+Math.sin(elapsed*.00018)*.22+tiltX*.12:-.62+(reduced?0:scrollProgress*TAU*(navCube?.65:.72)+(cinematic?pageProgress*TAU*.8:0)+(navCube?0:elapsed*.000035))+tiltX*.18;
    const pitch=mobileAuto?.48+Math.sin(elapsed*.00012)*.045+tiltY*.09:.48+(reduced?0:Math.sin(scrollProgress*Math.PI)*.3+Math.sin(elapsed*.00012)*.035)+tiltY*.12;
    multiply(rotation(0,pitch,b.x),rotation(1,yaw,b.y),b.rotation);
    multiply(translation(0,.08+Math.sin(elapsed*.0007)*.055,0,b.translation),b.rotation,b.global);
    const p=active?Math.min(active.elapsed/active.duration,1):0,ease=p*p*(3-2*p);
    if(active)rotation(active.move.axis,active.move.direction*Math.PI/2*ease,b.layer);
    const progress=Math.max(0,Math.min(1,scrollProgress/.5));
    const explosion=cinematic&&!reduced?1-progress*progress*(3-2*progress):0;
    const separation=!navCube&&!reduced?1+(cinematic?1.05*explosion:.1*(1-scrollProgress)):1;
    for(let i=0;i<cubies.length;i++) {
      const cubie=cubies[i],position=cubie.position;
      const x=mobileAuto?position[0]:position[0]*separation;
      const y=mobileAuto?position[1]:position[1]*separation+Math.sin(elapsed*.0004+cubie.home[0]*3+cubie.home[2])*explosion*.1;
      const z=mobileAuto?position[2]:position[2]*separation;
      multiply(translation(x,y,z,b.translation),cubie.orientation,b.local);
      let local=b.local;
      if(!mobileAuto&&explosion) {
        multiply(rotation(0,explosion*cubie.home[2]*.28,b.x),rotation(2,explosion*cubie.home[0]*.22,b.z),b.rotation);
        multiply(local,b.rotation,b.extra);local=b.extra;
      }
      if(active&&position[active.move.axis]===active.move.layer) {multiply(b.layer,local,b.turned);local=b.turned;}
      multiply(b.global,local,b.models[i]);
    }
    return b.models;
  }
  function packIndexedMeshData(meshes) {
    const vertices=meshes.reduce((sum,mesh)=>sum+mesh.length/9,0),data=new Float32Array(vertices*10);
    let offset=0;
    for(let cubie=0;cubie<meshes.length;cubie++) {
      const mesh=meshes[cubie];
      for(let i=0;i<mesh.length;i+=9) {for(let j=0;j<9;j++)data[offset+j]=mesh[i+j];data[offset+9]=cubie;offset+=10;}
    }
    return data;
  }

  // Треугольники с нормалями и цветом: position(3), normal(3), color(3).
  function makeCubieMesh(home) {
    const vertices=[];
    const lightTheme=typeof document!=='undefined'&&document.documentElement.dataset.theme==='light';
    const half=.472, inner=.415;
    // Одна палитра для телефона, компьютера и маленького кубика в шапке.
    const plastic=lightTheme?[.82,.75,.65]:[.065,.075,.09];
    const colors=lightTheme
      ? [[.60,.18,.30],[.86,.51,.35],[.97,.94,.86],[.83,.67,.40],[.44,.52,.42],[.62,.43,.50]]
      : [[.81,.92,.42],[.35,.76,.74],[.92,.91,.87],[.53,.56,.91],[.89,.60,.47],[.33,.47,.61]];
    function polygon(points,color,explicitNormal) {
      const a=points[0], b=points[1], c=points[2];
      const u=b.map((v,i)=>v-a[i]), v=c.map((n,i)=>n-a[i]);
      let normal=explicitNormal||[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      const length=Math.hypot(...normal); normal=normal.map(n=>n/length);
      for (let i=1;i<points.length-1;i++) for (const point of [a,points[i],points[i+1]]) vertices.push(...point,...normal,...color);
    }
    const axes=[0,1,2];
    // Шесть плоских граней корпуса и накладки со скруглёнными углами.
    for (const axis of axes) for (const sign of [1,-1]) {
      const [u,v]=axes.filter(a=>a!==axis);
      const point=(a,b,depth)=>{const p=[0,0,0];p[axis]=depth*sign;p[u]=a;p[v]=b;return p;};
      const normal=[0,0,0]; normal[axis]=sign;
      polygon([point(-inner,-inner,half),point(inner,-inner,half),point(inner,inner,half),point(-inner,inner,half)],plastic,normal);
      if (home[axis]!==sign) continue;
      const extent=.386, radius=.060, ring=[];
      for (let corner=0;corner<4;corner++) {
        const cx=corner===0||corner===3?extent-radius:-extent+radius;
        const cy=corner<2?extent-radius:-extent+radius;
        for (let step=0;step<=6;step++) {
          const angle=corner*Math.PI/2+step*Math.PI/12;
          ring.push(point(cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius,half+.003));
        }
      }
      const color=colors[axis*2+(sign===1?0:1)];
      const center=point(0,0,half+.003);
      for (let i=0;i<ring.length;i++) polygon([center,ring[i],ring[(i+1)%ring.length]],color,normal);
    }
    // 12 фасок вдоль рёбер, у которых свет даёт мягкие блики.
    for (const along of axes) {
      const [u,v]=axes.filter(a=>a!==along);
      for (const su of [1,-1]) for (const sv of [1,-1]) {
        const p=(t,a,b)=>{const n=[0,0,0];n[along]=t;n[u]=su*a;n[v]=sv*b;return n;};
        const normal=[0,0,0];normal[u]=su;normal[v]=sv;
        polygon([p(-inner,half,inner),p(inner,half,inner),p(inner,inner,half),p(-inner,inner,half)],plastic,normal);
      }
    }
    // Восемь маленьких угловых фасок закрывают корпус.
    for (const x of [1,-1]) for (const y of [1,-1]) for (const z of [1,-1]) {
      polygon([[x*half,y*inner,z*inner],[x*inner,y*half,z*inner],[x*inner,y*inner,z*half]],plastic,[x,y,z]);
    }
    return new Float32Array(vertices);
  }

  // Экспорт только для локальной проверки перестановок; в браузере запускается ниже.
  if (typeof module!=='undefined'&&module.exports) module.exports={CubeState,SCRAMBLE,inverseMoves,makeCubieMesh,multiply,rotation,transformPoint,perspective,solveSnapshots,restoreSnapshot,packMeshData,createModelBuffers,writeCubeModels,packIndexedMeshData};
  if (typeof document==='undefined') return;

  function startCube(canvasId='rubik-canvas',scrollDriven=false) {
    const canvas=document.getElementById(canvasId);
    if (!canvas) return;
    const navCube=canvasId==='rubik-nav-canvas';
    const mobile=window.matchMedia('(max-width: 900px)');
    const requestedCinematic=canvas.dataset.cinematic==='true';
    const requestedScrollDriven=scrollDriven||canvas.dataset.scrollCube==='hero';
    let mobileAuto=!navCube&&mobile.matches;
    let cinematic=requestedCinematic&&!mobileAuto;
    scrollDriven=requestedScrollDriven&&!mobileAuto;
    const visual=canvas.closest('.cube-voyager')||canvas.closest('.hero-visual')||canvas.parentElement;
    const status=document.getElementById(navCube?'nav-cube-status':'cube-status')||{textContent:''};
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const cube=new CubeState();
    const snapshots=requestedScrollDriven?solveSnapshots():null;
    let completedState=-1;
    let gl;
    try {gl=canvas.dataset.force2d?null:canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'default'});} catch {gl=null;}

    // Если WebGL отключён, та же объёмная геометрия рисуется обычным canvas.
    // Цветные грани сортируются по глубине, поэтому это не плоская картинка.
    const fallback=gl?null:canvas.getContext('2d');
    if (!gl&&!fallback) {status.textContent='ИЗ ДЕТАЛЕЙ — В ЦЕЛОЕ';return;}
    let program, locations,vertexBuffer;
    let batched=Boolean(gl&&gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)>=112);
    let meshes=cube.cubies.map(cubie=>({cubie,data:makeCubieMesh(cubie.home),buffer:null}));
    let packed=packMeshData(meshes.map(mesh=>mesh.data));
    let gpuData=batched?packIndexedMeshData(meshes.map(mesh=>mesh.data)):packed.data;
    const modelBuffers=createModelBuffers(cube.cubies.length);
    const pose={mobileAuto,navCube,cinematic,reduced:false,elapsed:0,scrollProgress:0,pageProgress:0,tiltX:0,tiltY:0,active:null};
    const projection=identity(),view=identity(),projectionView=identity();
    const uniformState={theme:-1,classic:-1,aspect:0,distance:0};
    function shader(type,source) {
      const handle=gl.createShader(type); gl.shaderSource(handle,source); gl.compileShader(handle);
      if (!gl.getShaderParameter(handle,gl.COMPILE_STATUS)) {gl.deleteShader(handle);throw new Error('Cube shader compilation failed');}
      return handle;
    }
    function setupGL() {
      const vertex=shader(gl.VERTEX_SHADER,`
        attribute vec3 a_position;
        attribute vec3 a_normal;
        attribute vec3 a_color;
        ${batched?'attribute float a_cubie; uniform mat4 u_models[26];':'uniform mat4 u_model;'}
        uniform mat4 u_projectionView;
        uniform mediump float u_classic;
        varying mediump vec3 v_normal;
        varying mediump vec3 v_color;
        varying mediump vec3 v_world;
        void main() {
          ${batched?'mat4 model=u_models[int(a_cubie)];':'mat4 model=u_model;'}
          vec4 world=model*vec4(a_position,1.0);
          gl_Position=u_projectionView*world;
          // Нормаль и рассеянный свет постоянны на плоской грани: считаем их на вершинах.
          v_normal=normalize(mat3(model)*a_normal);
          v_world=world.xyz;
          if(u_classic>0.5) {
            float diffuse=max(dot(v_normal,normalize(vec3(-0.5,0.85,0.9))),0.0);
            v_color=a_color*(0.55+0.5*diffuse);
          } else {
            float diffuse=max(dot(v_normal,normalize(vec3(-0.45,0.8,0.72))),0.0);
            float fill=max(dot(v_normal,normalize(vec3(.8,.2,-.7))),0.0);
            v_color=a_color*(.46+.58*diffuse+.14*fill);
          }
        }
      `);
      const fragment=shader(gl.FRAGMENT_SHADER,`
        precision mediump float;
        uniform float u_lightTheme;
        uniform float u_classic;
        varying mediump vec3 v_normal;
        varying mediump vec3 v_color;
        varying mediump vec3 v_world;
        void main() {
          vec3 normal=v_normal;
          if(u_classic>0.5) {
            vec3 light=normalize(vec3(-0.5,0.85,0.9));
            vec3 view=normalize(vec3(0.0,0.0,10.0)-v_world);
            float shine=pow(max(dot(normal,normalize(light+view)),0.0),48.0)*0.23;
            gl_FragColor=vec4(v_color+vec3(shine),1.0);
            return;
          }
          vec3 light=normalize(vec3(-0.45,0.8,0.72));
          vec3 view=normalize(vec3(0.0,0.0,10.0)-v_world);
          float shine=pow(max(dot(normal,normalize(light+view)),0.0),72.0)*0.43;
          float edge=1.0-max(dot(normal,view),0.0);
          float rim=edge*edge*edge;
          vec3 tint=mix(vec3(.57,.82,.8),vec3(.83,.68,.48),u_lightTheme);
          vec3 color=v_color+vec3(shine)+tint*rim*.12;
          gl_FragColor=vec4(color,1.0);
        }
      `);
      program=gl.createProgram(); gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
      gl.deleteShader(vertex);gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) {gl.deleteProgram(program);throw new Error('Cube shader linking failed');}
      gl.useProgram(program);
      locations={position:gl.getAttribLocation(program,'a_position'),normal:gl.getAttribLocation(program,'a_normal'),color:gl.getAttribLocation(program,'a_color'),cubie:batched?gl.getAttribLocation(program,'a_cubie'):-1,model:gl.getUniformLocation(program,batched?'u_models[0]':'u_model'),projectionView:gl.getUniformLocation(program,'u_projectionView'),lightTheme:gl.getUniformLocation(program,'u_lightTheme'),classic:gl.getUniformLocation(program,'u_classic')};
      vertexBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,gpuData,gl.STATIC_DRAW);
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
      // Отсечение граней не нужно: накладки и фаски имеют явные нормали.
      gl.clearColor(0,0,0,0);
      const stride=batched?40:36;
      for(const [location,offset] of [[locations.position,0],[locations.normal,12],[locations.color,24]]) {gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,stride,offset);}
      if(batched) {gl.enableVertexAttribArray(locations.cubie);gl.vertexAttribPointer(locations.cubie,1,gl.FLOAT,false,stride,36);}
      canvas.dataset.drawMode=batched?'batched':'individual';
      uniformState.theme=uniformState.classic=-1;uniformState.aspect=uniformState.distance=0;
    }
    function refreshTheme() {
      meshes=cube.cubies.map(cubie=>({cubie,data:makeCubieMesh(cubie.home),buffer:null}));
      packed=packMeshData(meshes.map(mesh=>mesh.data));
      gpuData=batched?packIndexedMeshData(meshes.map(mesh=>mesh.data)):packed.data;
      if (gl&&locations) {
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,gpuData,gl.STATIC_DRAW);
      }
      draw();
    }
    if (gl) {
      try {
        try {setupGL();}
        catch(error) {if(!batched)throw error;batched=false;gpuData=packed.data;setupGL();}
      }
      catch {
        const replacement=canvas.cloneNode(false);
        replacement.dataset.force2d='true';
        canvas.replaceWith(replacement);
        startCube(canvasId,scrollDriven);return;
      }
    }

    let width=0,height=0,dpr=1,frame=0,lastTime=0,elapsed=0,visible=true,lost=false;
    let pointerX=0,pointerY=0,tiltX=0,tiltY=0;
    let queue=inverseMoves(SCRAMBLE), index=0, active=null, wait=900, phase='solve';
    let scrollProgress=0, targetProgress=0, appliedProgress=-1, pageProgress=0,pageRange=1,available=1;
    if (!motion.matches) SCRAMBLE.forEach(move=>cube.turn(move));
    function resetSequence() {
      cube.reset();index=0;active=null;queue=inverseMoves(SCRAMBLE);phase='solve';wait=900;
      completedState=-1;appliedProgress=-1;
      canvas.dataset.animationMode=mobileAuto?'auto':'scroll';
      canvas.dataset.presentation=mobileAuto?'classic':'cinematic';
      if(mobileAuto){delete canvas.dataset.solveProgress;canvas.dataset.phase='solve';canvas.dataset.moveIndex='0';canvas.dataset.solved=String(motion.matches);}
      else {delete canvas.dataset.phase;delete canvas.dataset.moveIndex;}
      if (!motion.matches) SCRAMBLE.forEach(move=>cube.turn(move));
      status.textContent=motion.matches?'ВСЁ НА СВОИХ МЕСТАХ':'СОБИРАЕМ ПО ДЕТАЛЯМ';
    }
    resetSequence();

    function measureScrollRange() {
      pageRange=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      const hero=document.getElementById('home');
      const stage=document.querySelector('.hero-visual');
      available=navCube
        ? pageRange
        : cinematic&&innerWidth<=900
          ? Math.max(350,stage.getBoundingClientRect().top+scrollY+stage.clientHeight*.85-innerHeight*.4)
          : Math.max(250,hero.offsetTop+hero.offsetHeight-window.innerHeight+(cinematic?50:window.innerHeight*.35));
    }
    function readScrollTarget() {
      if (!scrollDriven) return;
      pageProgress=Math.max(0,Math.min(1,window.scrollY/pageRange));
      targetProgress=Math.max(0,Math.min(1,window.scrollY/available));
      if (motion.matches) {cube.reset();active=null;scrollProgress=0;draw();return;}
      if (!frame&&visible&&!document.hidden&&!lost) frame=requestAnimationFrame(tick);
    }
    function syncScrollCube() {
      if (!scrollDriven||motion.matches) return;
      if (Math.abs(appliedProgress-scrollProgress)<.00001) return;
      appliedProgress=scrollProgress;
      const solve=cinematic?Math.max(0,Math.min(1,(scrollProgress-.26)/.66)):scrollProgress;
      const raw=solve*queue.length;
      const completed=Math.min(queue.length,Math.floor(raw));
      if(completed!==completedState){restoreSnapshot(cube,snapshots[completed]);completedState=completed;}
      active=completed<queue.length?{move:queue[completed],elapsed:(raw-completed)*700,duration:700}:null;
      if (!navCube) {const text=completed===queue.length?'ВСЁ НА СВОИХ МЕСТАХ':'СОБИРАЕМ ПО ДЕТАЛЯМ';if(status.textContent!==text)status.textContent=text;}
      const progressLabel=scrollProgress.toFixed(3),solved=String(completed===queue.length);
      if(canvas.dataset.solveProgress!==progressLabel)canvas.dataset.solveProgress=progressLabel;
      if(canvas.dataset.solved!==solved)canvas.dataset.solved=solved;
    }

    function advance(delta) {
      if (active) {
        active.elapsed+=delta;
        if (active.elapsed>=active.duration) {
          cube.turn(active.move);active=null;index++;wait=phase==='solve'?180:90;
          if (index===queue.length) {
            phase=phase==='solve'?'solved':'scrambled';
            wait=phase==='solved'?2600:950;
            status.textContent=phase==='solved'?'ВСЁ НА СВОИХ МЕСТАХ':'СОБИРАЕМ ПО ДЕТАЛЯМ';
          }
          if(mobileAuto){canvas.dataset.phase=phase;canvas.dataset.moveIndex=String(index);canvas.dataset.solved=String(cube.isSolved());}
        }
        return;
      }
      wait-=delta;
      if (wait>0) return;
      if (phase==='solved') {queue=SCRAMBLE;phase='scramble';index=0;status.textContent='НОВАЯ ЗАДАЧА';}
      else if (phase==='scrambled') {queue=inverseMoves(SCRAMBLE);phase='solve';index=0;}
      active={move:queue[index],elapsed:0,duration:phase==='solve'?700:340};
      if(mobileAuto){canvas.dataset.phase=phase;canvas.dataset.moveIndex=String(index);if(phase==='scramble')canvas.dataset.solved='false';}
    }
    function modelMatrices() {
      pose.mobileAuto=mobileAuto;pose.cinematic=cinematic;pose.reduced=motion.matches;
      pose.elapsed=elapsed;pose.scrollProgress=scrollProgress;pose.pageProgress=pageProgress;
      pose.tiltX=tiltX;pose.tiltY=tiltY;pose.active=active;
      return writeCubeModels(cube.cubies,pose,modelBuffers);
    }
    const fallbackTriangles=fallback?meshes.flatMap((mesh,meshIndex)=>Array.from({length:mesh.data.length/27},(_,i)=>({meshIndex,offset:i*27,index:packed.offsets[meshIndex]/3+i,points:new Float64Array(9),depth:0,color:''}))):null;
    const fallbackLightLength=Math.hypot(.5,.85,.9);
    function drawFallback(models) {
      const distance=navCube?10:(cinematic?10.7+(1-scrollProgress)*3.2:10);
      const scale=Math.min(width,height)*(cinematic?1.54:1.7);
      for(const triangle of fallbackTriangles) {
        const data=meshes[triangle.meshIndex].data,m=models[triangle.meshIndex],i=triangle.offset,points=triangle.points;
        for(let vertex=0;vertex<3;vertex++) {
          const offset=i+vertex*9,out=vertex*3,x=data[offset],y=data[offset+1],z=data[offset+2];
          points[out]=m[0]*x+m[4]*y+m[8]*z+m[12];
          points[out+1]=m[1]*x+m[5]*y+m[9]*z+m[13];
          points[out+2]=m[2]*x+m[6]*y+m[10]*z+m[14];
        }
        const nx=m[0]*data[i+3]+m[4]*data[i+4]+m[8]*data[i+5]+m[12]-m[12];
        const ny=m[1]*data[i+3]+m[5]*data[i+4]+m[9]*data[i+5]+m[13]-m[13];
        const nz=m[2]*data[i+3]+m[6]*data[i+4]+m[10]*data[i+5]+m[14]-m[14];
        const shade=.55+.5*Math.max(0,(-.5*nx+.85*ny+.9*nz)/fallbackLightLength);
        triangle.depth=(points[2]+points[5]+points[8])/3;
        const r=Math.min(255,Math.round(data[i+6]*shade*255)),g=Math.min(255,Math.round(data[i+7]*shade*255)),b=Math.min(255,Math.round(data[i+8]*shade*255));
        if(r!==triangle.r||g!==triangle.g||b!==triangle.b) {triangle.r=r;triangle.g=g;triangle.b=b;triangle.color='rgb('+r+','+g+','+b+')';}
      }
      fallbackTriangles.sort((a,b)=>a.depth-b.depth||a.index-b.index);
      fallback.setTransform(dpr,0,0,dpr,0,0);fallback.clearRect(0,0,width,height);
      fallback.lineWidth=.3;
      for (const triangle of fallbackTriangles) {
        const points=triangle.points;
        fallback.beginPath();
        fallback.moveTo(width/2+points[0]*scale/(distance-points[2]),height/2-points[1]*scale/(distance-points[2]));
        fallback.lineTo(width/2+points[3]*scale/(distance-points[5]),height/2-points[4]*scale/(distance-points[5]));
        fallback.lineTo(width/2+points[6]*scale/(distance-points[8]),height/2-points[7]*scale/(distance-points[8]));fallback.closePath();
        fallback.fillStyle=triangle.color;fallback.fill();
        fallback.strokeStyle=fallback.fillStyle;fallback.lineWidth=.3;fallback.stroke();
      }
    }
    function draw() {
      if (!width||!height||lost||!visible||document.hidden) return;
      const models=modelMatrices();
      if (!gl) {drawFallback(models);return;}
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const lightTheme=document.documentElement.dataset.theme==='light'?1:0,classic=mobileAuto?1:0;
      if(uniformState.theme!==lightTheme){gl.uniform1f(locations.lightTheme,lightTheme);uniformState.theme=lightTheme;}
      if(uniformState.classic!==classic){gl.uniform1f(locations.classic,classic);uniformState.classic=classic;}
      // Размер кубика ограничен меньшей стороной блока, в том числе на телефоне.
      const aspect=width/height;
      const baseDistance=mobileAuto?9.4:cinematic?10.7+(1-scrollProgress)*3.2:9.8;
      const distance=navCube?8.0:(aspect<1?baseDistance/aspect:baseDistance);
      if(uniformState.aspect!==aspect||uniformState.distance!==distance){gl.uniformMatrix4fv(locations.projectionView,false,multiply(perspective(Math.PI/5,aspect,.1,100,projection),translation(0,0,-distance,view),projectionView));uniformState.aspect=aspect;uniformState.distance=distance;}
      if(batched) {gl.uniformMatrix4fv(locations.model,false,modelBuffers.data);gl.drawArrays(gl.TRIANGLES,0,gpuData.length/10);}
      else for (let i=0;i<meshes.length;i++) {gl.uniformMatrix4fv(locations.model,false,models[i]);gl.drawArrays(gl.TRIANGLES,packed.offsets[i],meshes[i].data.length/9);}
    }
    function resize() {
      width=visual.clientWidth;height=visual.clientHeight;
      dpr=Math.min(window.devicePixelRatio||1,mobileAuto?1.5:1.75);
      const pixelWidth=Math.max(1,Math.round(width*dpr)),pixelHeight=Math.max(1,Math.round(height*dpr));
      if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
      if(gl)gl.viewport(0,0,canvas.width,canvas.height);
      if(scrollDriven)measureScrollRange();
      readScrollTarget();
      draw();
    }
    function tick(time) {
      frame=0;
      if (!visible||document.hidden||motion.matches||lost) {lastTime=0;return;}
      // WebGL следует частоте экрана. Тяжёлый программный fallback остаётся на 20 fps.
      if(!gl&&lastTime&&time-lastTime<50){frame=requestAnimationFrame(tick);return;}
      const delta=lastTime?Math.min(mobileAuto?50:70,time-lastTime):0;lastTime=time;elapsed+=delta;
      const steps=delta?delta/(1000/(navCube?60:30)):1;
      const tiltAmount=1-Math.pow(.94,steps),scrollAmount=1-Math.pow(.84,steps);
      tiltX+=(pointerX-tiltX)*tiltAmount;tiltY+=(pointerY-tiltY)*tiltAmount;
      if (scrollDriven) {
        scrollProgress+=(targetProgress-scrollProgress)*scrollAmount;
        if (Math.abs(targetProgress-scrollProgress)<.0001) scrollProgress=targetProgress;
        syncScrollCube();
      } else advance(delta);
      draw();
      // Маленький кубик перерисовывается только пока изменяется позиция прокрутки.
      if (!navCube||Math.abs(targetProgress-scrollProgress)>.0001) frame=requestAnimationFrame(tick);
      else lastTime=0;
    }
    function sync() {
      if (frame) cancelAnimationFrame(frame);frame=0;lastTime=0;
      canvas.dataset.renderState=visible&&!document.hidden&&!lost?'active':'paused';
      if(!visible||document.hidden||lost)return;
      if (motion.matches) {cube.reset();active=null;elapsed=0;tiltX=0;tiltY=0;scrollProgress=0;draw();}
      else if (scrollDriven) {appliedProgress=-1;readScrollTarget();scrollProgress=targetProgress;syncScrollCube();draw();}
      else if (visible&&!document.hidden&&!lost) frame=requestAnimationFrame(tick);
    }
    visual.addEventListener('pointermove',event=>{
      if (motion.matches||event.pointerType==='touch') return;
      const rect=visual.getBoundingClientRect();
      pointerX=(event.clientX-rect.left)/width-.5;pointerY=(event.clientY-rect.top)/height-.5;
    });
    visual.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(visual);
    else window.addEventListener('resize',resize);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(visual);
    document.addEventListener('visibilitychange',sync);
    motion.addEventListener('change',()=>{resetSequence();sync();});
    mobile.addEventListener('change',()=>{
      const next=!navCube&&mobile.matches;
      if(next===mobileAuto)return;
      mobileAuto=next;cinematic=requestedCinematic&&!mobileAuto;scrollDriven=requestedScrollDriven&&!mobileAuto;
      scrollProgress=targetProgress=pageProgress=0;resetSequence();refreshTheme();resize();sync();
    });
    window.addEventListener('vorby-theme-change',refreshTheme);
    window.addEventListener('vorby-layout-measured',event=>{pageRange=event.detail.maxScroll;available=navCube?pageRange:event.detail.assemblyRange;readScrollTarget();});
    if (requestedScrollDriven) window.addEventListener('scroll',readScrollTarget,{passive:true});
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;sync();});
    canvas.addEventListener('webglcontextrestored',()=>{lost=false;setupGL();resize();sync();});
    window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;});
    window.addEventListener('pageshow',sync);
    resize();sync();
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>startCube(),{once:true});
  else startCube();
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>startCube('rubik-nav-canvas',true),{once:true});
  else startCube('rubik-nav-canvas',true);
})();
