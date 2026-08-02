document.addEventListener('DOMContentLoaded', () => {
    const introCard = document.getElementById('introCard');
    const bloomBtn = document.getElementById('bloomBtn');
    const scene = document.getElementById('scene');
    const flower = document.getElementById('flower');

    const PETAL_LAYERS = [
        { count: 15, w: 115, h: 135, cls: 'layer7', radius: 8, tilt: 25, zOffset: 0 },
        { count: 13, w: 100, h: 120, cls: 'layer6', radius: 5, tilt: 35, zOffset: 8 },
        { count: 11, w: 85, h: 105, cls: 'layer5', radius: 3, tilt: 45, zOffset: 16 },
        { count: 9, w: 70, h: 90, cls: 'layer4', radius: 1, tilt: 55, zOffset: 24 },
        { count: 7, w: 55, h: 75, cls: 'layer3', radius: 0, tilt: 65, zOffset: 32 },
        { count: 5, w: 45, h: 60, cls: 'layer2', radius: 0, tilt: 75, zOffset: 40 },
        { count: 3, w: 40, h: 50, cls: 'layer1', radius: 0, tilt: 85, zOffset: 48 }
    ];

    function createPetals() {
        const styleSheet = document.createElement('style');
        let cssRules = '';
        
        const totalAnimDur = 5.0; // 5 seconds for the whole sequence
        const budFormTime = 0.5; // Forms bud in first 0.5s
        const budFormPct = (budFormTime / totalAnimDur) * 100;

        PETAL_LAYERS.forEach((layer, li) => {
            const angleStep = 360 / layer.count;
            const layerOffset = li * 24 + (Math.random() - 0.5) * 15;
            
            // 0 is outermost (layer7), 6 is innermost (layer1)
            // We want outermost to bloom first, so its index li determines the start time directly.
            const bloomStartTime = budFormTime + (li * 0.3) + (Math.random() * 0.2);
            
            for (let i = 0; i < layer.count; i++) {
                const petal = document.createElement('div');
                petal.className = `petal ${layer.cls}`;
                
                const angle = layerOffset + i * angleStep + (Math.random() - 0.5) * 4;
                
                // Timing logic: outer layers (li=0) start first.
                const baseDelay = 2.5;
                const delay = baseDelay + (li * 0.3) + Math.random() * 0.15;
                const bloomDur = 2.0 + Math.random() * 0.5;
                
                const scaleJitter = 0.95 + Math.random() * 0.1;
                const animName = `bloom-${li}-${i}`;
                
                petal.style.width = `${layer.w}px`;
                petal.style.height = `${layer.h}px`;
                petal.style.marginLeft = `${-layer.w / 2}px`;
                
                const zJitter = Math.random() * 2; // Prevent Z-fighting
                const finalZ = layer.zOffset + zJitter;
                
                petal.style.transform = `scale(0)`; // Default state before animation
                
                cssRules += `
                    @keyframes ${animName} {
                        0% {
                            transform: rotateZ(${angle}deg) translateZ(${finalZ * 0.2}px) translateY(-${layer.radius * 0.2}px) rotateX(-85deg) scale(0);
                        }
                        30% {
                            /* Bud shape: mostly vertical, tight radius */
                            transform: rotateZ(${angle}deg) translateZ(${finalZ * 0.5}px) translateY(-${layer.radius * 0.3}px) rotateX(-80deg) scale(${scaleJitter * 0.6});
                        }
                        100% {
                            /* Flared U shape */
                            transform: rotateZ(${angle}deg) translateZ(${finalZ}px) translateY(-${layer.radius}px) rotateX(-${layer.tilt}deg) scale(${scaleJitter});
                        }
                    }
                `;
                
                petal.dataset.anim = `${animName} ${bloomDur}s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s both`;
                
                flower.appendChild(petal);
            }
        });

        styleSheet.innerText = cssRules;
        document.head.appendChild(styleSheet);
    }

    function createParticles() {
        const scene = document.getElementById('scene');
        const numParticles = 40;
        for (let i = 0; i < numParticles; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 3 + 1.5;
            const duration = 8 + Math.random() * 15;
            const delay = Math.random() * 10;
            p.style.left = `${x}%`;
            p.style.top = `${y}%`;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.animationDuration = `${duration}s`;
            p.style.animationDelay = `-${delay}s`;
            scene.appendChild(p);
        }
    }

    function createThorns() {
        const stem = document.querySelector('.stem');
        const numThorns = 8;
        for (let i = 0; i < numThorns; i++) {
            const thorn = document.createElement('div');
            const isLeft = i % 2 === 0;
            thorn.className = `thorn ${isLeft ? 'left' : 'right'}`;
            const topPos = 50 + Math.random() * 180;
            thorn.style.top = `${topPos}px`;
            const rot = isLeft ? -20 - Math.random() * 20 : 20 + Math.random() * 20;
            thorn.style.transform = `rotate(${rot}deg)`;
            thorn.style.transitionDelay = `${1 + (topPos / 280)}s`; 
            stem.appendChild(thorn);
        }
    }

    createPetals();
    createParticles();
    createThorns();

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function handleMove(clientX, clientY) {
        if (!scene.classList.contains('active')) return;
        targetX = (clientX / window.innerWidth - 0.5) * 2;
        targetY = (clientY / window.innerHeight - 0.5) * 2;
    }

    function animateCamera() {
        if (scene.classList.contains('active')) {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            
            // Gerakan dikurangi agar tidak terlalu goyang (shaky)
            const rotateX = currentY * -8; 
            const rotateY = currentX * 12;  
            scene.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
        requestAnimationFrame(animateCamera);
    }
    
    requestAnimationFrame(animateCamera);

    document.addEventListener('mousemove', (e) => {
        handleMove(e.clientX, e.clientY);
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
            document.documentElement.style.setProperty('--mouse-x', `${e.touches[0].clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.touches[0].clientY}px`);
        }
    });

    const butterflyMessages = [
        "Love you 🤍",
        "Love you more! 🦋",
        "Love you so much!! 💕",
        "Always & Forever 🌹",
        "My Princess... 👑",
        "You're magic ✨",
        "I'm yours 💖"
    ];
    let bClickCount = 0;

    function spawnButterfly() {
        const plantContainer = document.querySelector('.plant-container');
        if (!plantContainer) return;
        
        const durY = 12 + Math.random() * 8; // Orbit melingkar pelan
        const durBob = 2 + Math.random() * 2; // Gerakan naik turun pelan
        const radius = 160 + Math.random() * 80; // Jarak dari batang/bunga
        const height = -100 - Math.random() * 200; // Tinggi dari bawah batang
        
        const orbitWrap = document.createElement('div');
        orbitWrap.className = 'b-orbit';
        orbitWrap.style.position = 'absolute';
        orbitWrap.style.bottom = '0';
        orbitWrap.style.left = '50%';
        orbitWrap.style.transformStyle = 'preserve-3d';
        orbitWrap.style.animation = `orbitSmooth ${durY}s linear infinite`;
        orbitWrap.style.animationDelay = `-${Math.random() * durY}s`; // Posisi awal acak
        
        const bobWrap = document.createElement('div');
        bobWrap.style.position = 'absolute';
        bobWrap.style.transformStyle = 'preserve-3d';
        bobWrap.style.animation = `flyBob ${durBob}s ease-in-out infinite alternate`;
        
        const b = document.createElement('div');
        b.className = 'butterfly';
        // rotateX(75deg) makes it fly horizontally instead of standing upright
        b.style.transform = `translateY(${height}px) translateZ(${radius}px) rotateY(90deg) rotateX(75deg)`; 
        b.style.pointerEvents = 'auto';
        b.style.cursor = 'pointer';
        b.style.width = '50px';
        b.style.height = '50px';
        b.style.marginLeft = '-25px';
        b.style.marginTop = '-25px';
        b.innerHTML = `
            <div class="wing left"></div>
            <div class="wing right"></div>
        `;
        
        bobWrap.appendChild(b);
        orbitWrap.appendChild(bobWrap);
        plantContainer.appendChild(orbitWrap);
        
        orbitWrap.style.opacity = '0';
        orbitWrap.style.transform = 'scale(0)';
        setTimeout(() => { 
            orbitWrap.style.transition = 'opacity 2s ease-out, transform 2s ease-out'; 
            orbitWrap.style.opacity = '1'; 
            orbitWrap.style.transform = 'scale(1)';
        }, 50);
    }

    function createButterflies() {
        // Munculkan 4 kupu-kupu secara bergantian
        for(let i = 0; i < 4; i++) {
            setTimeout(spawnButterfly, i * 600);
        }
    }

    document.addEventListener('click', (e) => {
        const b = e.target.closest('.butterfly');
        if (b) {
            // Teks muncul
            const text = document.createElement('div');
            text.className = 'floating-love-text';
            text.innerText = butterflyMessages[Math.min(bClickCount, butterflyMessages.length - 1)];
            text.style.left = `${e.clientX}px`;
            text.style.top = `${e.clientY}px`;
            document.body.appendChild(text);
            
            setTimeout(() => text.remove(), 2500);
            
            // Kupu-kupu yang diklik menghilang (ditangkap)
            const wrapper = b.closest('.b-orbit');
            if (wrapper) {
                wrapper.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                wrapper.style.opacity = '0';
                wrapper.style.transform = 'scale(1.5)';
                setTimeout(() => wrapper.remove(), 400);
            }
            
            bClickCount++;
            
            // Kupu-kupu baru muncul entah dari mana setelah sedikit jeda
            setTimeout(spawnButterfly, 800);
        }
    });

    const bgMusic = new Audio('shape_of_my_heart.mp3');
    bgMusic.loop = true;

    bloomBtn.addEventListener('click', () => {
        bgMusic.play().catch(e => console.log('Audio play failed:', e));
        introCard.classList.add('hidden');
        
        // Wait for card to fade out before starting scene
        setTimeout(() => {
            scene.classList.add('active');
            
            // Trigger petal animations
            const petals = document.querySelectorAll('.petal');
            petals.forEach(p => {
                p.style.animation = p.dataset.anim;
            });

            // Start rotating after blooming finishes (2.5s delay + 5.0s animation = 7.5s)
            setTimeout(() => {
                flower.classList.add('rotating');
                createButterflies();
            }, 7500);
            
        }, 600);
    });

    const descText = "Bunga mawar ini mungkin tidak secantik dirimu, tapi ia akan mekar spesial hanya untukmu hari ini...";
    const descEl = document.getElementById('introDesc');
    const cursor = document.getElementById('cursor');
    const btnWrapper = document.getElementById('btnWrapper');
    
    let dIndex = 0;
    function typeDesc() {
        if (dIndex < descText.length) {
            descEl.innerHTML += descText.charAt(dIndex);
            dIndex++;
            const typingSpeed = Math.random() * 50 + 30;
            setTimeout(typeDesc, typingSpeed);
        } else {
            setTimeout(() => {
                btnWrapper.style.display = 'block';
                void btnWrapper.offsetWidth; // Trigger reflow for CSS transition
                btnWrapper.style.opacity = '1';
                btnWrapper.style.transform = 'translateY(0)';
            }, 500);
        }
    }

    setTimeout(typeDesc, 1200);
});
