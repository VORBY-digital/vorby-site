/*
 * Настоящая геометрия кубика 3 × 3 на WebGL, без Three.js и загрузки моделей.
 * 26 кубиков, 54 цветные накладки, скруглённые края и направленное освещение.
 * Каждый поворот переставляет детали. Сборка — обратные ходы перемешивания.
 */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const identity = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  function multiply(a,b) {
    const result = new Float32Array(16);
    for (let col=0;col<4;col++) for (let row=0;row<4;row++) {
      result[col*4+row] = a[row]*b[col*4]+a[4+row]*b[col*4+1]+a[8+row]*b[col*4+2]+a[12+row]*b[col*4+3];
    }
    return result;
  }
  function rotation(axis,angle) {
    const c=Math.cos(angle), s=Math.sin(angle);
    if (axis===0) return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
    if (axis===1) return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
    return new Float32Array([c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]);
  }
  function translation(x,y,z) {const m=identity(); m[12]=x; m[13]=y; m[14]=z; return m;}
  function transformPoint(m,p) {
    return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
  }
  function perspective(fov,aspect,near,far) {
    const f=1/Math.tan(fov/2), range=1/(near-far);
    return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*range,-1, 0,0,2*far*near*range,0]);
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

  // Треугольники с нормалями и цветом: position(3), normal(3), color(3).
  function makeCubieMesh(home) {
    const vertices=[];
    const half=.472, inner=.415, plastic=[.042,.048,.039];
    const colors=[[.98,.30,.23],[1,.58,.16],[.93,.96,.91],[1,.84,.20],[.66,.90,.30],[.22,.46,.94]];
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
  if (typeof module!=='undefined'&&module.exports) module.exports={CubeState,SCRAMBLE,inverseMoves,makeCubieMesh,multiply,rotation,transformPoint,perspective};
  if (typeof document==='undefined') return;

  function startCube() {
    const canvas=document.getElementById('rubik-canvas');
    if (!canvas) return;
    const visual=canvas.closest('.hero-visual');
    const status=document.getElementById('cube-status');
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const cube=new CubeState();
    let gl;
    try {gl=canvas.dataset.force2d?null:canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});} catch {gl=null;}

    // Если WebGL отключён, та же объёмная геометрия рисуется обычным canvas.
    // Цветные грани сортируются по глубине, поэтому это не плоская картинка.
    const fallback=gl?null:canvas.getContext('2d');
    if (!gl&&!fallback) {status.textContent='ИЗ ДЕТАЛЕЙ — В ЦЕЛОЕ';return;}
    let program, locations;
    const meshes=cube.cubies.map(cubie=>({cubie,data:makeCubieMesh(cubie.home),buffer:null}));
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
        uniform mat4 u_model;
        uniform mat4 u_projectionView;
        varying mediump vec3 v_normal;
        varying mediump vec3 v_color;
        varying mediump vec3 v_world;
        void main() {
          vec4 world=u_model*vec4(a_position,1.0);
          gl_Position=u_projectionView*world;
          v_normal=mat3(u_model)*a_normal;
          v_world=world.xyz;
          v_color=a_color;
        }
      `);
      const fragment=shader(gl.FRAGMENT_SHADER,`
        precision mediump float;
        varying mediump vec3 v_normal;
        varying mediump vec3 v_color;
        varying mediump vec3 v_world;
        void main() {
          vec3 normal=normalize(v_normal);
          vec3 light=normalize(vec3(-0.5,0.85,0.9));
          vec3 view=normalize(vec3(0.0,0.0,10.0)-v_world);
          float diffuse=max(dot(normal,light),0.0);
          float shine=pow(max(dot(normal,normalize(light+view)),0.0),48.0)*0.23;
          vec3 color=v_color*(0.55+0.5*diffuse)+vec3(shine);
          gl_FragColor=vec4(color,1.0);
        }
      `);
      program=gl.createProgram(); gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
      gl.deleteShader(vertex);gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Cube shader linking failed');
      gl.useProgram(program);
      locations={position:gl.getAttribLocation(program,'a_position'),normal:gl.getAttribLocation(program,'a_normal'),color:gl.getAttribLocation(program,'a_color'),model:gl.getUniformLocation(program,'u_model'),projectionView:gl.getUniformLocation(program,'u_projectionView')};
      for (const mesh of meshes) {mesh.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.data,gl.STATIC_DRAW);}
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
      // Отсечение граней не нужно: накладки и фаски имеют явные нормали.
      gl.clearColor(0,0,0,0);
    }
    if (gl) {
      try {setupGL();}
      catch {
        const replacement=canvas.cloneNode(false);
        replacement.dataset.force2d='true';
        canvas.replaceWith(replacement);
        startCube();return;
      }
    }

    let width=0,height=0,dpr=1,frame=0,lastTime=0,elapsed=0,visible=true,lost=false;
    let pointerX=0,pointerY=0,tiltX=0,tiltY=0;
    let queue=inverseMoves(SCRAMBLE), index=0, active=null, wait=900, phase='solve';
    if (!motion.matches) SCRAMBLE.forEach(move=>cube.turn(move));
    function resetSequence() {
      cube.reset();index=0;active=null;queue=inverseMoves(SCRAMBLE);phase='solve';wait=900;
      if (!motion.matches) SCRAMBLE.forEach(move=>cube.turn(move));
      status.textContent=motion.matches?'ВСЁ НА СВОИХ МЕСТАХ':'СОБИРАЕМ ПО ДЕТАЛЯМ';
    }
    resetSequence();

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
        }
        return;
      }
      wait-=delta;
      if (wait>0) return;
      if (phase==='solved') {queue=SCRAMBLE;phase='scramble';index=0;status.textContent='НОВАЯ ЗАДАЧА';}
      else if (phase==='scrambled') {queue=inverseMoves(SCRAMBLE);phase='solve';index=0;}
      active={move:queue[index],elapsed:0,duration:phase==='solve'?700:340};
    }
    function modelMatrices() {
      const yaw=-.62+Math.sin(elapsed*.00018)*.22+tiltX*.12;
      const pitch=.48+Math.sin(elapsed*.00012)*.045+tiltY*.09;
      const global=multiply(translation(0,.08+Math.sin(elapsed*.0007)*.055,0),multiply(rotation(0,pitch),rotation(1,yaw)));
      const p=active?Math.min(active.elapsed/active.duration,1):0;
      const ease=p*p*(3-2*p);
      const layer=active?rotation(active.move.axis,active.move.direction*Math.PI/2*ease):null;
      return meshes.map(mesh=>{
        const cubie=mesh.cubie;
        let local=multiply(translation(...cubie.position),cubie.orientation);
        if (active&&cubie.position[active.move.axis]===active.move.layer) local=multiply(layer,local);
        return multiply(global,local);
      });
    }
    function drawFallback(models) {
      const triangles=[];
      const scale=Math.min(width,height)*1.7;
      meshes.forEach((mesh,index)=>{
        const data=mesh.data, matrix=models[index];
        for (let i=0;i<data.length;i+=27) {
          const points=[0,9,18].map(offset=>transformPoint(matrix,[data[i+offset],data[i+offset+1],data[i+offset+2]]));
          const normal=transformPoint(matrix,[data[i+3],data[i+4],data[i+5]]).map((n,a)=>n-matrix[12+a]);
          const shade=.55+.5*Math.max(0,(-.5*normal[0]+.85*normal[1]+.9*normal[2])/Math.hypot(.5,.85,.9));
          triangles.push({points,depth:points.reduce((sum,p)=>sum+p[2],0)/3,color:[data[i+6],data[i+7],data[i+8]].map(n=>Math.min(255,Math.round(n*shade*255)))});
        }
      });
      triangles.sort((a,b)=>a.depth-b.depth);
      fallback.setTransform(dpr,0,0,dpr,0,0);fallback.clearRect(0,0,width,height);
      for (const triangle of triangles) {
        const points=triangle.points.map(p=>[width/2+p[0]*scale/(10-p[2]),height/2-p[1]*scale/(10-p[2])]);
        fallback.beginPath();fallback.moveTo(...points[0]);fallback.lineTo(...points[1]);fallback.lineTo(...points[2]);fallback.closePath();
        fallback.fillStyle='rgb('+triangle.color.join(',')+')';fallback.fill();
        fallback.strokeStyle=fallback.fillStyle;fallback.lineWidth=.3;fallback.stroke();
      }
    }
    function draw() {
      if (!width||!height||lost) return;
      const models=modelMatrices();
      if (!gl) {drawFallback(models);return;}
      gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
      // Размер кубика ограничен меньшей стороной блока, в том числе на телефоне.
      const aspect=width/height;
      const distance=aspect<1?9.4/aspect:9.4;
      gl.uniformMatrix4fv(locations.projectionView,false,multiply(perspective(Math.PI/5,aspect,.1,100),translation(0,0,-distance)));
      for (let i=0;i<meshes.length;i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER,meshes[i].buffer);
        for (const [location,offset] of [[locations.position,0],[locations.normal,12],[locations.color,24]]) {
          gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,36,offset);
        }
        gl.uniformMatrix4fv(locations.model,false,models[i]);gl.drawArrays(gl.TRIANGLES,0,meshes[i].data.length/9);
      }
    }
    function resize() {
      width=visual.clientWidth;height=visual.clientHeight;
      dpr=Math.min(window.devicePixelRatio||1,1.75);
      canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
      draw();
    }
    function tick(time) {
      frame=0;
      if (!visible||document.hidden||motion.matches||lost) {lastTime=0;return;}
      const delta=lastTime?Math.min(50,time-lastTime):0;lastTime=time;elapsed+=delta;
      tiltX+=(pointerX-tiltX)*.06;tiltY+=(pointerY-tiltY)*.06;
      advance(delta);draw();frame=requestAnimationFrame(tick);
    }
    function sync() {
      if (frame) cancelAnimationFrame(frame);frame=0;lastTime=0;
      if (motion.matches) {cube.reset();active=null;elapsed=0;tiltX=0;tiltY=0;draw();}
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
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;sync();});
    canvas.addEventListener('webglcontextrestored',()=>{lost=false;setupGL();resize();sync();});
    window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;});
    window.addEventListener('pageshow',sync);
    resize();sync();
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',startCube,{once:true});
  else startCube();
})();
