(() => {
      'use strict';
      const $ = (s) => document.querySelector(s);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const petalCanvas = $('#petals'), fxCanvas = $('#fx');
      const pctx = petalCanvas.getContext('2d'), fctx = fxCanvas.getContext('2d');
      let W = innerWidth, H = innerHeight, dpr = 1, petals = [], hearts = [], particles = [], raf = 0, isOpen = false;
      const rand = (a, b) => Math.random() * (b - a) + a;
      function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
        [petalCanvas, fxCanvas].forEach(c => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); c.style.width = W + 'px'; c.style.height = H + 'px' });
        pctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!petals.length) for (let i = 0; i < Math.min(48, Math.floor(W / 18)); i++) petals.push(new Petal(true));
      }
      class Petal {
        constructor(initial = false) { this.reset(initial) }
        reset(initial = false) { this.x = rand(-20, W + 20); this.y = initial ? rand(-H, H) : rand(-70, -10); this.size = rand(5, 11); this.speed = rand(.55, 1.7); this.phase = rand(0, Math.PI * 2); this.spin = rand(-.035, .035); this.rot = rand(0, 6.28); this.alpha = rand(.4, .85); this.hue = rand(330, 350) }
        update(t) { this.y += this.speed; this.phase += .018; this.x += Math.sin(this.phase) * .75 + Math.sin(t * .0004 + this.phase) * .25; this.rot += this.spin; if (this.y > H + 20) this.reset() }
        draw(c) { c.save(); c.translate(this.x, this.y); c.rotate(this.rot); c.globalAlpha = this.alpha; c.fillStyle = `hsl(${this.hue},78%,${rand(65, 78)}%)`; c.beginPath(); c.moveTo(0, -this.size); c.bezierCurveTo(this.size * 1.6, -this.size * .5, this.size * 1.3, this.size * .9, 0, this.size); c.bezierCurveTo(-this.size * 1.3, this.size * .9, -this.size * 1.6, -this.size * .5, 0, -this.size); c.fill(); c.restore() }
      }
      class Particle {
        constructor(x, y, kind = 'spark', color) { this.x = x; this.y = y; this.kind = kind; this.color = color || ['#ffd76a', '#fff1ad', '#f06292', '#e91e63', '#fff8fb', '#b39ddb'][Math.floor(rand(0, 6))]; const a = rand(0, Math.PI * 2), v = kind === 'heart' ? rand(1.2, 4.2) : rand(1.5, 6.5); this.vx = Math.cos(a) * v; this.vy = Math.sin(a) * v; this.life = 1; this.decay = rand(.009, .019); this.size = kind === 'heart' ? rand(5, 12) : rand(2, 4.5); this.gravity = kind === 'heart' ? .045 : .055; this.rot = rand(0, 6.28); this.spin = rand(-.12, .12) }
        update() { this.x += this.vx; this.y += this.vy; this.vy += this.gravity; this.vx *= .992; this.vy *= .992; this.life -= this.decay; this.rot += this.spin }
        draw(c) { c.save(); c.globalAlpha = Math.max(0, this.life); c.translate(this.x, this.y); c.rotate(this.rot); if (this.kind === 'heart') { c.fillStyle = this.color; c.beginPath(); c.moveTo(0, this.size * .35); c.bezierCurveTo(-this.size * 1.8, -this.size * .7, -this.size * .8, -this.size * 1.6, 0, -this.size * .7); c.bezierCurveTo(this.size * .8, -this.size * 1.6, this.size * 1.8, -this.size * .7, 0, this.size * .35); c.fill() } else { c.fillStyle = this.color; if (this.kind === 'confetti') { c.fillRect(-this.size / 2, -this.size, this.size, this.size * 2) } else { c.shadowBlur = 10; c.shadowColor = this.color; c.beginPath(); c.arc(0, 0, this.size, 0, Math.PI * 2); c.fill() } } c.restore() }
      }
      function burst(x, y, count = 85, heartsToo = true) { for (let i = 0; i < count; i++)particles.push(new Particle(x, y, heartsToo && Math.random() < .32 ? 'heart' : (Math.random() < .35 ? 'confetti' : 'spark'))) }
      function celebration(big = false) { const n = big ? 5 : 3; for (let i = 0; i < n; i++) { setTimeout(() => { burst(rand(W * .12, W * .88), rand(H * .12, H * .52), big ? 105 : 75, true) }, i * 180) } }
      function animate(t) {
        pctx.clearRect(0, 0, W, H); for (const p of petals) { p.update(t); p.draw(pctx) }
        fctx.clearRect(0, 0, W, H);
        if (Math.random() < .035 && hearts.length < 18) hearts.push({ x: rand(0, W), y: H + 20, size: rand(9, 18), speed: rand(.35, .9), drift: rand(-.35, .35), alpha: rand(.2, .5), phase: rand(0, 6.28) });
        hearts = hearts.filter(h => h.y > -30); for (const h of hearts) { h.y -= h.speed; h.x += Math.sin(t * .001 + h.phase) * .35 + h.drift; fctx.save(); fctx.globalAlpha = h.alpha; fctx.fillStyle = '#fff1f7'; fctx.translate(h.x, h.y); fctx.scale(h.size / 15, h.size / 15); fctx.beginPath(); fctx.moveTo(0, 5); fctx.bezierCurveTo(-17, -5, -8, -14, 0, -6); fctx.bezierCurveTo(8, -14, 17, -5, 0, 5); fctx.fill(); fctx.restore() }
        particles = particles.filter(p => p.life > 0); for (const p of particles) { p.update(); p.draw(fctx) }
        raf = requestAnimationFrame(animate);
      }
      
      const bgMusic = $('#bgMusic');
      const musicBtn = $('#musicToggle'), musicBtnText = $('#musicBtnText');
      let audioContext = null, audioGain = null, audioSource = null;

      function updateMusicUI(isPlaying) {
        if (!musicBtn) return;
        musicBtn.classList.toggle('playing', isPlaying);
        if (musicBtnText) musicBtnText.textContent = isPlaying ? 'Tắt nhạc' : 'Bật nhạc';
      }

      async function prepareLouderAudio() {
        if (!bgMusic) return;
        bgMusic.volume = 1;
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          if (!audioContext) {
            audioContext = new AudioContextClass();
            audioSource = audioContext.createMediaElementSource(bgMusic);
            audioGain = audioContext.createGain();
            audioGain.gain.value = 3.2;

            const compressor = audioContext.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-14, audioContext.currentTime);
            compressor.knee.setValueAtTime(24, audioContext.currentTime);
            compressor.ratio.setValueAtTime(8, audioContext.currentTime);
            compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
            compressor.release.setValueAtTime(0.25, audioContext.currentTime);

            audioSource.connect(audioGain);
            audioGain.connect(compressor);
            compressor.connect(audioContext.destination);
          }
          if (audioContext.state === 'suspended') await audioContext.resume();
        } catch (err) {
          // Fallback retained
        }
      }

      async function startBackgroundMusic() {
        if (!bgMusic) return;
        await prepareLouderAudio();
        try {
          if (bgMusic.currentTime < 12) bgMusic.currentTime = 12;
          await bgMusic.play();
          updateMusicUI(true);
          const note = $('.music-note'); if (note) note.textContent = 'Nhạc piano đang phát · đã tăng cường âm lượng tối đa.';
        } catch (err) {
          updateMusicUI(false);
          const note = $('.music-note'); if (note) note.textContent = 'Chạm vào màn hình hoặc nút nhạc để bật âm lượng lớn.';
        }
      }

      if (bgMusic) {
        bgMusic.addEventListener('play', () => updateMusicUI(true));
        bgMusic.addEventListener('pause', () => updateMusicUI(false));
      }

      if (musicBtn) {
        musicBtn.addEventListener('click', async () => {
          await prepareLouderAudio();
          if (audioContext && audioContext.state === 'suspended') await audioContext.resume();
          if (bgMusic.paused) {
            if (bgMusic.currentTime < 12) bgMusic.currentTime = 12;
            bgMusic.play().then(() => updateMusicUI(true)).catch(() => {});
          } else {
            bgMusic.pause();
            updateMusicUI(false);
          }
        });
      }

      window.addEventListener('load', startBackgroundMusic, { once: true });
      ['pointerdown', 'keydown', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, async () => {
          if (audioContext && audioContext.state === 'suspended') await audioContext.resume();
          if (bgMusic && bgMusic.paused) startBackgroundMusic();
        }, { once: true, passive: true });
      });

      // Delightful touch interaction: tap anywhere spawns sparkles/hearts
      document.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        burst(e.clientX, e.clientY, 16, true);
      }, { passive: true });

      resize(); window.addEventListener('resize', resize, { passive: true }); raf = requestAnimationFrame(animate);
      const app = $('#app'), envelope = $('#openEnvelope');

      // --- TÍNH NĂNG ĐỒNG BỘ CUỘN TRANG & CHẠY CHỮ TUẦN TỰ THEO TẦM MẮT ĐỌC ---
      let autoScrollRaf = null;
      let isAutoScrolling = false;
      let userPauseTimer = null;
      let isUserTouching = false;
      let currentScrollY = 0;
      let isCurrentlyTyping = false;
      let currentTypingWish = null;
      let wishNextTimer = null;

      function stopAutoScroll() {
        if (autoScrollRaf) {
          cancelAnimationFrame(autoScrollRaf);
          autoScrollRaf = null;
        }
        if (userPauseTimer) {
          clearTimeout(userPauseTimer);
          userPauseTimer = null;
        }
        isAutoScrolling = false;
        isUserTouching = false;
      }

      function startAutoScroll(initialDelay = 2600) {
        stopAutoScroll();
        if (!isOpen || reducedMotion) return;

        userPauseTimer = setTimeout(() => {
          if (!isOpen) return;
          isAutoScrolling = true;
          currentScrollY = window.scrollY;
          let lastTime = performance.now();

          function roll(now) {
            if (!isOpen || !isAutoScrolling) return;
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            if (!isUserTouching) {
              const isMobile = window.innerWidth < 600;
              // Tốc độ điều chỉnh:
              // Khi đang chạy chữ 1 câu chúc: cuộn rất chậm để người đọc theo kịp nét chữ (18px/s mobile, 11px/s desktop)
              // Khi chuyển tiếp giữa các câu hoặc chưa tới câu mới: 30px/s mobile, 18px/s desktop
              let speed;
              if (isCurrentlyTyping) {
                speed = isMobile ? 18 : 11;
              } else {
                speed = isMobile ? 30 : 18;
              }

              const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
              if (window.scrollY < maxScroll - 2) {
                currentScrollY += speed * dt;
                window.scrollTo(0, currentScrollY);
              } else {
                // Đã cuộn đến đáy trang (lời kết & nút đóng)
                stopAutoScroll();
                return;
              }
            } else {
              currentScrollY = window.scrollY;
            }

            // Kiểm tra và kích hoạt câu chúc kế tiếp trong tầm mắt
            checkWishesInView();

            autoScrollRaf = requestAnimationFrame(roll);
          }
          autoScrollRaf = requestAnimationFrame(roll);
        }, initialDelay);
      }

      function onUserManualScroll() {
        checkWishesInView();
        if (!isAutoScrolling) return;
        isUserTouching = true;
        currentScrollY = window.scrollY;
        if (userPauseTimer) clearTimeout(userPauseTimer);
        // Tạm dừng khi người dùng chủ động chạm/lăn chuột, sau 3.5s sẽ tiếp tục cuộn nhẹ
        userPauseTimer = setTimeout(() => {
          isUserTouching = false;
          currentScrollY = window.scrollY;
        }, 3500);
      }

      ['wheel', 'touchmove', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, onUserManualScroll, { passive: true });
      });
      window.addEventListener('touchend', () => {
        if (userPauseTimer) clearTimeout(userPauseTimer);
        userPauseTimer = setTimeout(() => {
          isUserTouching = false;
          currentScrollY = window.scrollY;
        }, 3000);
      }, { passive: true });
      window.addEventListener('scroll', checkWishesInView, { passive: true });

      // --- CƠ CHẾ GÕ CHỮ TUẦN TỰ (SEQUENTIAL QUEUE) THEO TẦM MẮT ---
      function resetWishes() {
        isCurrentlyTyping = false;
        currentTypingWish = null;
        if (wishNextTimer) {
          clearTimeout(wishNextTimer);
          wishNextTimer = null;
        }
        const wishes = document.querySelectorAll('.wish');
        wishes.forEach(wish => {
          wish.dataset.typed = 'false';
          wish.dataset.typing = 'false';
          wish.classList.remove('reading');
          const line = wish.querySelector('.typed-line');
          if (line) {
            line.textContent = '';
            line.classList.remove('typing', 'done');
          }
        });
      }

      function typeSingleWish(wishCard) {
        if (!wishCard || wishCard.dataset.typed === 'true' || wishCard.dataset.typing === 'true') return;
        if (isCurrentlyTyping) return; // Bảo vệ nghiêm ngặt: chỉ 1 câu chúc chạy tại một thời điểm

        const line = wishCard.querySelector('.typed-line');
        if (!line) return;

        isCurrentlyTyping = true;
        currentTypingWish = wishCard;
        wishCard.dataset.typing = 'true';
        wishCard.classList.add('reading');
        line.classList.add('typing');
        line.classList.remove('done');
        line.textContent = '';

        const text = line.dataset.text || '';
        let charIndex = 0;

        function stepChar() {
          if (!isOpen) {
            isCurrentlyTyping = false;
            currentTypingWish = null;
            return;
          }

          // Nếu người nhận lướt vội làm thẻ này trôi hẳn lên trên đỉnh màn hình
          const rect = wishCard.getBoundingClientRect();
          if (rect.bottom < 60) {
            line.textContent = text;
            line.classList.remove('typing');
            line.classList.add('done');
            wishCard.dataset.typing = 'false';
            wishCard.dataset.typed = 'true';
            wishCard.classList.remove('reading');
            isCurrentlyTyping = false;
            currentTypingWish = null;
            // Kích hoạt kiểm tra ngay câu tiếp theo đang trong tầm mắt
            checkWishesInView();
            return;
          }

          if (charIndex < text.length) {
            line.textContent += text.charAt(charIndex++);
            setTimeout(stepChar, reducedMotion ? 0 : 21);
          } else {
            // Đã hoàn thành câu chúc hiện tại
            line.classList.remove('typing');
            line.classList.add('done');
            wishCard.dataset.typing = 'false';
            wishCard.dataset.typed = 'true';
            setTimeout(() => {
              wishCard.classList.remove('reading');
            }, 450);

            isCurrentlyTyping = false;
            currentTypingWish = null;

            // Nghỉ nhẹ 320ms giữa 2 câu chúc rồi kích hoạt tuần tự câu tiếp theo nếu đang trong tầm mắt
            if (wishNextTimer) clearTimeout(wishNextTimer);
            wishNextTimer = setTimeout(() => {
              if (isOpen) checkWishesInView();
            }, 320);
          }
        }
        stepChar();
      }

      function checkWishesInView() {
        if (!isOpen) return;
        const wishes = document.querySelectorAll('.wish');
        const vh = window.innerHeight;

        // 1. Tự động điền hoàn tất các câu chúc đã bị người dùng cuộn vượt hẳn lên phía trên màn hình
        wishes.forEach(wish => {
          if (wish.dataset.typed === 'true') return;
          const rect = wish.getBoundingClientRect();
          if (rect.bottom < 60) {
            const line = wish.querySelector('.typed-line');
            if (line) {
              line.textContent = line.dataset.text || '';
              line.classList.remove('typing');
              line.classList.add('done');
            }
            wish.dataset.typed = 'true';
            wish.dataset.typing = 'false';
            wish.classList.remove('reading');
            if (currentTypingWish === wish) {
              isCurrentlyTyping = false;
              currentTypingWish = null;
            }
          }
        });

        // 2. NẾU ĐANG CÓ CÂU CHÚC ĐANG CHẠY CHỮ THÌ CHỜ — TUYỆT ĐỐI KHÔNG CHO PHÉP NHIỀU CÂU CHẠY CÙNG LÚC!
        if (isCurrentlyTyping) return;

        // 3. DUYỆT TUẦN TỰ TỪ TRÊN XUỐNG DƯỚI: Tìm câu chúc đầu tiên chưa hoàn thành
        for (let i = 0; i < wishes.length; i++) {
          const wish = wishes[i];
          if (wish.dataset.typed === 'true') continue;

          const rect = wish.getBoundingClientRect();
          // Điều kiện lọt vào tầm mắt đọc (từ 80% chiều cao màn hình trở lên và chưa bị khuất phía trên)
          if (rect.top <= vh * 0.80 && rect.bottom >= 60) {
            typeSingleWish(wish);
            // CỰC KỲ QUAN TRỌNG: break ngay lập tức để chỉ chạy duy nhất câu này!
            // Dù trên màn hình có 2 hay 3 câu chúc cùng lúc, các câu sau bắt buộc phải chờ câu này chạy xong!
            break;
          } else if (rect.top > vh * 0.80) {
            // Thẻ này còn ở tít bên dưới chưa tới tầm mắt, dừng duyệt vì các thẻ sau nó cũng ở dưới
            break;
          }
        }
      }


      function openCard() {
        if (isOpen) return;
        isOpen = true;
        resetWishes();
        app.classList.add('opening');
        setTimeout(() => {
          if (isOpen) {
            app.classList.add('card-opened');
            window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
          }
        }, 360);
        $('#introText').textContent = 'Chúc mừng ngày đặc biệt của các chị và các bạn';
        celebration(true);
        setTimeout(() => burst(W / 2, H * .52, 130, true), 350);
        
        // Đợi 2.6s để người đọc xem xong tiêu đề, sau đó bắt đầu cuộn và kích hoạt gõ chữ khi tới câu chúc
        startAutoScroll(2600);

        // Kích hoạt kiểm tra câu chúc đầu tiên nếu đã lọt vào tầm mắt sau khi mở thiệp
        setTimeout(() => {
          if (isOpen) checkWishesInView();
        }, 2200);

        const music = $('#bgMusic');
        const mp = $('#musicPanel');
        if (mp) mp.classList.add('visible');
        if (music) {
          prepareLouderAudio().then(() => {
            if (audioContext && audioContext.state === 'suspended') audioContext.resume();
          });
          if (music.paused) {
            if (music.currentTime < 12) music.currentTime = 12;
            music.play().then(() => updateMusicUI(true)).catch(() => {
              const note = $('.music-note'); if (note) note.textContent = 'Nếu nhạc chưa phát, hãy chạm vào màn hình hoặc nút nhạc để nghe.';
            });
          }
        }
      }

      function closeCard() {
        if (!isOpen) return;
        stopAutoScroll();
        if (wishNextTimer) { clearTimeout(wishNextTimer); wishNextTimer = null; }
        resetWishes();
        const music = $('#bgMusic');
        if (music) { music.pause(); music.currentTime = 12; updateMusicUI(false); }
        const mp = $('#musicPanel');
        if (mp) mp.classList.remove('visible');
        app.classList.remove('opening', 'card-opened');
        isOpen = false;
        $('#introText').textContent = 'Gửi các chị và các bạn nữ DHP';
        celebration(false);
        for (let i = 0; i < 45; i++)particles.push(new Particle(rand(W * .25, W * .75), rand(H * .2, H * .55), 'heart'));
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      }

      envelope.addEventListener('click', openCard);
      $('#closeCard').addEventListener('click', closeCard);
      envelope.addEventListener('pointerdown', e => {
        for (let i = 0; i < 14; i++)particles.push(new Particle(e.clientX, e.clientY, 'spark', '#ffe9a0'));
      });
    })();