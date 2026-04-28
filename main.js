// main.js - Vanilla JS Logic for Band Harmony (Korean Default)

const todayInit = new Date();
const ty = todayInit.getFullYear();
const tm = String(todayInit.getMonth() + 1).padStart(2, '0');

// 기본 모의 데이터베이스 (기본값)
const defaultDB = {
  schedules: [
    { date: `${ty}-${tm}-10`, time: '19:00', venue: '스튜디오 A (홍대)', type: '합주' },
    { date: `${ty}-${tm}-15`, time: '18:00', venue: '롤링홀', type: '공연' },
    { date: `${ty}-${tm}-22`, time: '20:00', venue: '스튜디오 C (강남)', type: '합주' }
  ],
  feed: [
    { id: 1, user: 'Alex V.', time: '2시간 전', title: '보컬 연습 - Let It Be', img: 'assets/vocal_practice_studio_1777189643054.png', comments: 3, views: 142, tags: ['#보컬', '#어쿠스틱'], liked: false },
    { id: 2, user: 'John B.', time: '5시간 전', title: '베이스 슬랩 라인 데모', img: 'assets/bass_guitar_demo_1777189676344.png', comments: 1, views: 89, tags: ['#베이스', '#그루브'], liked: false },
    { id: 3, user: 'Sam D.', time: '1일 전', title: '드럼 필인 아이디어', img: 'assets/drum_fill_idea_1777189711658.png', comments: 6, views: 304, tags: ['#드럼', '#비트'], liked: false }
  ],
  userProfile: {
    name: 'Alex Vocalist',
    handle: '@alex_vocal',
    bio: '세계를 흔들 준비가 된 싱어! 이번 달 롤링홀 세트리스트 완벽하게 준비중입니다.',
    instruments: ['보컬', '어쿠스틱 기타'],
    gear: 'Shure SM7B, Taylor 214ce',
    favGenres: ['얼터너티브 락', '인디', '알앤비']
  }
};

// 데이터베이스 초기화 (로컬 스토리지 유지)
let DB = localStorage.getItem('bandHarmonyDB') 
  ? JSON.parse(localStorage.getItem('bandHarmonyDB')) 
  : JSON.parse(JSON.stringify(defaultDB));

const persistDB = () => {
  localStorage.setItem('bandHarmonyDB', JSON.stringify(DB));
};

let calDate = new Date(); // 현재 보고있는 캘린더 달력 기준 시간

// --- 상호작용 로직 ---

window.toggleLike = (btn, feedId) => {
  const feedItem = DB.feed.find(f => f.id === feedId);
  const icon = btn.querySelector('i');
  
  if (icon.classList.contains('ph-fill')) {
    icon.className = 'ph ph-heart';
    btn.style.color = 'var(--text-secondary)';
    icon.style.color = '';
    if (feedItem) feedItem.liked = false;
  } else {
    icon.className = 'ph-fill ph-heart';
    btn.style.color = 'var(--inst-vocal)';
    icon.style.color = 'var(--inst-vocal)';
    if (feedItem) feedItem.liked = true;
  }
  
  persistDB();
};

window.executeSearch = (query) => {
  const searchTerm = query !== null ? query : document.getElementById('feed-search-input').value;
  if (!searchTerm || searchTerm.trim() === '') return;
  
  const results = DB.feed.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.tags && f.tags.some(t => t.toLowerCase() === searchTerm.toLowerCase()))
  );

  const modal = document.createElement('div');
  modal.className = 'search-overlay';
  
  let resultsHtml = '';
  if (results.length > 0) {
    resultsHtml = results.map(item => `
      <div class="feed-card glass-panel" style="margin-bottom: 24px;">
        <div class="feed-user" style="padding-bottom: 12px;">
          <div class="user-avatar-wrapper">
            <div class="user-avatar"><i class="ph-fill ph-user"></i></div>
          </div>
          <div>
            <strong>${item.user}</strong>
            <small>${item.time}</small>
          </div>
        </div>
        <div class="feed-video-placeholder" style="background-image: url('${item.img}'); height: 180px; border-radius: 12px;">
          <div class="play-btn" onclick="this.style.color='var(--accent-secondary)';"><i class="ph-fill ph-play-circle"></i></div>
        </div>
        <div class="feed-content" style="padding: 12px 0 0 0;">
          <h3 style="font-size: 16px;">${item.title}</h3>
          ${item.tags ? `<div class="feed-tags">${item.tags.map(t => `<span class="feed-tag-sm" onclick="this.closest('.search-overlay').remove(); window.executeSearch('${t}')">${t}</span>`).join('')}</div>` : ''}
        </div>
      </div>
    `).join('');
  } else {
    resultsHtml = `<p style="text-align: center; color: var(--text-secondary); margin-top: 60px;">"${searchTerm}" 검색 결과가 없습니다.</p>`;
  }

  modal.innerHTML = `
    <div class="search-overlay-header">
      <button style="background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center;" onclick="this.closest('.search-overlay').remove()">
        <i class="ph ph-arrow-left" style="font-size: 24px;"></i>
      </button>
      <input type="text" class="styled-textarea" style="flex: 1; height: 40px; min-height: 40px; margin: 0 12px; padding: 4px 16px; border-radius: 20px;" value="${searchTerm}" onkeypress="if(event.key === 'Enter') { this.closest('.search-overlay').remove(); window.executeSearch(this.value); }">
      <button style="background: none; border: none; color: var(--accent-color); font-weight: 600; cursor: pointer; padding: 8px;" onclick="this.closest('.search-overlay').remove(); window.executeSearch(this.previousElementSibling.value)">검색</button>
    </div>
    <div class="search-overlay-content">
      <h3 style="margin-bottom: 24px; color: var(--text-secondary);">"${searchTerm}" 검색 결과 (${results.length})</h3>
      <div class="feed-list">
        ${resultsHtml}
      </div>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  setTimeout(() => modal.classList.add('active'), 10);
};

window.showCommentsModal = (feedId) => {
  const feedItem = DB.feed.find(f => f.id === feedId);
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()">
      <h3 style="margin-bottom: 20px;">'${feedItem?.title || ''}' 댓글</h3>
      <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
        <div style="margin-bottom: 16px; font-size: 14px;"><strong>Jane (Ky):</strong> 분위기 너무 좋아요!</div>
        <div style="margin-bottom: 16px; font-size: 14px;"><strong>Mike (Eg):</strong> 다음 합주 때 이 라인 템포 좀만 올리죠.</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <input type="text" class="styled-textarea" style="min-height:40px; flex: 1; padding: 10px;" placeholder="댓글을 입력하세요...">
        <button class="btn-primary" style="padding: 10px 16px;" onclick="alert('댓글이 등록되었습니다!'); this.closest('.modal-backdrop').remove();">등록</button>
      </div>
      <button class="btn-secondary w-100 mt-20" onclick="this.closest('.modal-backdrop').remove()">닫기</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.showShareModal = (feedId) => {
  const dummyUrl = `https://bandharmony.app/feed/${feedId}`;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()">
      <h3 style="margin-bottom: 16px;">링크 공유하기</h3>
      <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">다른 멤버들에게 이 연습 영상을 공유해 보세요!</p>
      
      <div style="display: flex; gap: 8px; margin-bottom: 24px;">
        <input type="text" id="share-url-input" class="styled-textarea" style="flex: 1; height: 44px; min-height: 44px; padding: 0 16px; font-size: 14px; line-height: 44px;" value="${dummyUrl}" readonly>
        <button class="btn-primary" style="padding: 0 20px; white-space: nowrap; height: 44px; display:flex; align-items:center; justify-content:center;" onclick="
          const input = document.getElementById('share-url-input');
          input.select();
          input.setSelectionRange(0, 99999);
          try {
            navigator.clipboard.writeText(input.value).then(() => {
              window.showToast('클립보드에 복사되었습니다!');
              this.closest('.modal-backdrop').remove();
            }).catch(ext => {
              document.execCommand('copy');
              window.showToast('클립보드에 복사되었습니다!');
              this.closest('.modal-backdrop').remove();
            });
          } catch (err) {
            document.execCommand('copy');
            window.showToast('클립보드에 복사되었습니다!');
            this.closest('.modal-backdrop').remove();
          }
        ">복사</button>
      </div>
      <button class="btn-secondary w-100" onclick="this.closest('.modal-backdrop').remove()">닫기</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.deleteFeedPost = (id) => {
  if(confirm("정말로 이 게시물을 피드에서 삭제하시겠습니까?")) {
    DB.feed = DB.feed.filter(f => f.id !== id);
    persistDB();
    const pageFeed = document.getElementById('page-feed');
    if(pageFeed && pageFeed.classList.contains('active')) pageFeed.innerHTML = renderFeedPage();
    window.showToast("성공적으로 게시물이 삭제되었습니다.");
  }
};

window.editFeedPost = (id) => {
  const item = DB.feed.find(f => f.id === id);
  if(!item) return;
  const newTitle = prompt("새로운 제목이나 내용을 입력하세요:", item.title);
  if(newTitle !== null && newTitle.trim() !== '') {
    item.title = newTitle;
    persistDB();
    const pageFeed = document.getElementById('page-feed');
    if(pageFeed && pageFeed.classList.contains('active')) pageFeed.innerHTML = renderFeedPage();
    window.showToast("서버에 게시물이 수정되었습니다.");
  }
};

window.showAddEventModal = (dateStr) => {
  const [y, m, d] = dateStr.split('-');
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()" style="max-height: 90vh; overflow-y: auto;">
      <h3 style="margin-bottom: 20px; color: var(--text-primary);">${parseInt(m)}월 ${parseInt(d)}일 일정 추가</h3>
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">일정 제목</label>
      <input type="text" id="ev-title" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 20px;" placeholder="예: 보컬 녹음">
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">시간</label>
      <input type="time" id="ev-time" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 24px;" value="19:00">
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">세션 (악기 선택 및 멤버 입력)</label>
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="v" data-type="V"><div class="session-badge sess-var-v">V</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="v" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="보컬 이름">
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="eg" data-type="Eg"><div class="session-badge sess-var-eg">Eg</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="eg" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="기타리스트 이름">
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="b" data-type="B"><div class="session-badge sess-var-b">B</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="b" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="베이시스트 이름">
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="d" data-type="D"><div class="session-badge sess-var-d">D</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="d" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="드러머 이름">
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="k" data-type="K"><div class="session-badge sess-var-k">K</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="k" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="키보디스트 이름">
        </div>
      </div>
      
      <button class="btn-primary w-100" onclick="window.saveNewEvent('${dateStr}', this.closest('.modal-backdrop'))">저장</button>
      <button class="btn-secondary w-100 mt-20" onclick="this.closest('.modal-backdrop').remove()">취소</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.showEventDetailModal = (dateStr, venue) => {
  const ev = DB.schedules.find(s => s.date === dateStr && s.venue === venue);
  if (!ev) return;
  
  const [y, m, d] = dateStr.split('-');
  const displayTitle = `${parseInt(m)}월 ${parseInt(d)}일`;
  
  let membersHtml = '';
  if (ev.members && ev.members.length > 0) {
     membersHtml = ev.members.map(m => `
       <div class="sess-item"><div class="session-badge sess-var-${m.inst}"> ${m.type} </div> ${m.name}</div>
     `).join('');
  } else {
     membersHtml = `
       <div class="sess-item"><div class="session-badge sess-var-v">V</div> Alex</div>
       <div class="sess-item"><div class="session-badge sess-var-eg">Eg</div> Mike</div>
       ${ev.type === '합주' ? `<div class="sess-item"><div class="session-badge sess-var-b">B</div> John</div>` : ''}
       ${ev.type === '공연' ? `<div class="sess-item"><div class="session-badge sess-var-d">D</div> Sam</div>` : ''}
     `;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()">
      <h3 style="margin-bottom: 8px; color: var(--accent-secondary); font-size: 14px;">${ev.type} 일정</h3>
      <h2 style="margin-bottom: 24px; font-size: 24px; line-height: 1.3;">${ev.venue}</h2>
      
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; font-size: 15px;">
        <p><i class="ph ph-calendar-blank" style="margin-right: 8px; color: var(--text-secondary); font-size: 18px;"></i> ${displayTitle}</p>
        <p><i class="ph ph-clock" style="margin-right: 8px; color: var(--text-secondary); font-size: 18px;"></i> ${ev.time}</p>
      </div>

      <h4 style="margin-bottom: 12px; color: var(--text-secondary); border-top: 1px solid var(--stroke-color); padding-top: 20px;">참여 멤버</h4>
      <div class="session-list" style="margin-bottom: 30px;">
        ${membersHtml}
      </div>

      <button class="btn-secondary w-100" onclick="this.closest('.modal-backdrop').remove()">닫기</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.saveNewEvent = (dateStr, modalEl) => {
  const title = modalEl.querySelector('#ev-title').value || '새 세션';
  const time = modalEl.querySelector('#ev-time').value || '19:00';
  
  const assigned = [];
  modalEl.querySelectorAll('.sess-toggle-btn.active').forEach(btn => {
     const inst = btn.getAttribute('data-inst');
     const type = btn.getAttribute('data-type');
     const nameInput = modalEl.querySelector('.inst-name[data-inst="' + inst + '"]').value || '미정';
     assigned.push({ type: type, inst: inst, name: nameInput });
  });

  const newEvent = {
    date: dateStr,
    time: time,
    venue: title,
    type: '합주',
    members: assigned
  };
  
  DB.schedules.push(newEvent);
  DB.schedules.sort((a, b) => new Date(a.date) - new Date(b.date));
  persistDB(); // 동기화
  
  modalEl.remove();

  window.showToast('일정이 성공적으로 등록되었습니다!');
  
  // 캘린더 점 찍기 및 디테일 구역에 새 일정 리로드
  document.querySelectorAll('.cal-date').forEach(el => {
    if (el.getAttribute('onclick') && el.getAttribute('onclick').includes(dateStr)) {
      if (!el.querySelector('.cal-dot')) {
        el.innerHTML += '<div class="cal-dot"></div>';
      }
    }
  });

  const container = document.getElementById('calendar-details-container');
  if(container) {
    container.innerHTML = renderDateDetails(dateStr);
  }
};

window.showUploadModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()">
      <h3 style="margin-bottom: 20px; color: var(--text-primary);">연습 영상 업로드</h3>
      
      <div style="width: 100%; height: 120px; background: rgba(0,0,0,0.3); border: 1px dashed var(--stroke-color); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; cursor: pointer; color: var(--text-secondary);" onclick="
        if(confirm('Band Harmony 앱이 기기의 사진 및 동영상 앨범에 접근하려고 합니다. 권한을 허용하시겠습니까?')) {
          this.innerHTML = '<i class=\\'ph-fill ph-check-circle\\' style=\\'font-size: 32px; margin-bottom: 8px; color: var(--accent-secondary);\\'></i><span style=\\'color: white;\\'>녹화된 세션_1.mp4 (선택됨)</span>';
          this.style.borderStyle = 'solid';
          this.style.borderColor = 'var(--accent-secondary)';
          this.style.background = 'rgba(57, 255, 20, 0.1)';
        }
      ">
        <i class="ph ph-video-camera" style="font-size: 32px; margin-bottom: 8px;"></i>
        <span>비디오 파일을 선택하려면 탭하세요</span>
      </div>
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">설명/제목</label>
      <textarea id="upload-desc" class="styled-textarea" style="min-height:80px; margin-top: 8px; margin-bottom: 20px;" placeholder="오늘은 무엇을 연습하셨나요?"></textarea>
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">태그 (쉼표로 구분)</label>
      <input type="text" id="upload-tags" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 30px;" placeholder="예: #보컬, #개인연습">
      
      <button class="btn-primary w-100" onclick="window.saveFeedUpload(this.closest('.modal-backdrop'))"><i class="ph ph-upload-simple"></i> 영상 게시</button>
      <button class="btn-secondary w-100 mt-20" onclick="this.closest('.modal-backdrop').remove()">취소</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.saveFeedUpload = (modalEl) => {
  const desc = modalEl.querySelector('#upload-desc').value || '새 연습 트랙';
  let rawTags = modalEl.querySelector('#upload-tags').value || '#연습';
  const tagList = rawTags.split(',').map(t => {
    let tr = t.trim();
    if (!tr.startsWith('#')) tr = '#' + tr;
    return tr;
  });

  const newFeed = {
    id: Date.now(),
    user: 'Alex Vocalist',
    time: '방금 전',
    title: desc,
    img: 'assets/drum_fill_idea_1777189711658.png',
    comments: 0,
    views: 0,
    tags: tagList,
    liked: false
  };

  DB.feed.unshift(newFeed);
  persistDB(); // 동기화
  
  modalEl.remove();

  window.showToast('영상이 성공적으로 업로드되었습니다!');
  
  const pageFeed = document.getElementById('page-feed');
  if (pageFeed && pageFeed.classList.contains('active')) {
    pageFeed.innerHTML = renderFeedPage();
  }
};

window.showToast = (msg) => {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translate(-50%, -20px)';
  toast.style.background = 'var(--accent-color)';
  toast.style.color = 'white';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '24px';
  toast.style.boxShadow = '0 4px 12px var(--accent-glow)';
  toast.style.zIndex = '1000';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.3s ease';
  toast.innerText = msg;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

window.changeMonth = (delta) => {
  calDate.setMonth(calDate.getMonth() + delta);
  const pageCal = document.getElementById('page-calendar');
  if (pageCal) {
    pageCal.innerHTML = renderCalendarPage();
  }
};

window.handleDateSelect = (dateStr, el) => {
  if (el) {
    document.querySelectorAll('.cal-date').forEach(e => e.classList.remove('active-date'));
    el.classList.add('active-date');
  }

  const container = document.getElementById('calendar-details-container');
  if(container) {
    container.innerHTML = renderDateDetails(dateStr);
  }
};

const renderDateDetails = (dateStr) => {
  const [y, m, d] = dateStr.split('-');
  const displayTitle = `${parseInt(m)}월 ${parseInt(d)}일`;
  const events = DB.schedules.filter(s => s.date === dateStr);
  
  if (events.length > 0) {
    return `
      <h2>${displayTitle} 상세 일정</h2>
      ${events.map(ev => {
        let membersHtml = '';
        if (ev.members && ev.members.length > 0) {
           membersHtml = ev.members.map(m => `
             <div class="sess-item"><div class="session-badge sess-var-${m.inst}"> ${m.type} </div> ${m.name}</div>
           `).join('');
        } else {
           membersHtml = `
             <div class="sess-item"><div class="session-badge sess-var-v">V</div> Alex</div>
             <div class="sess-item"><div class="session-badge sess-var-eg">Eg</div> Mike</div>
             ${ev.type === '합주' ? `<div class="sess-item"><div class="session-badge sess-var-b">B</div> John</div>` : ''}
             ${ev.type === '공연' ? `<div class="sess-item"><div class="session-badge sess-var-d">D</div> Sam</div>` : ''}
           `;
        }
        return `
          <div class="glass-panel session-card mt-20">
            <h3>${ev.venue}</h3>
            <p class="time">${ev.time}</p>
            <div class="session-assignment mt-20">
              <h4 style="margin-bottom: 12px; color: var(--text-secondary);">참여 멤버</h4>
              <div class="session-list">
                ${membersHtml}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    `;
  } else {
    return `
      <h2>${displayTitle} 상세 일정</h2>
      <div class="glass-panel mt-20" style="text-align: center; padding: 40px 20px;">
        <i class="ph ph-calendar-x" style="font-size: 40px; color: var(--text-secondary); margin-bottom: 12px;"></i>
        <p style="margin-bottom: 24px;">이 날짜에 계획된 일정이 없습니다.</p>
        <button class="btn-primary" style="margin: 0 auto;" onclick="window.showAddEventModal('${dateStr}')"><i class="ph ph-plus"></i> 일정 추가</button>
      </div>
    `;
  }
};

window.showEditProfileModal = () => {
  const p = DB.userProfile || defaultDB.userProfile;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()" style="max-height: 85vh; overflow-y: auto;">
      <h3 style="margin-bottom: 20px;">내 프로필 설정</h3>
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">이름</label>
      <input type="text" id="edit-name" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 20px;" value="${p.name}">
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">자기소개 및 다짐</label>
      <textarea id="edit-bio" class="styled-textarea" style="min-height:80px; margin-top: 8px; margin-bottom: 20px;">${p.bio}</textarea>

      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">사용 악기 (쉼표로 구분)</label>
      <input type="text" id="edit-inst" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 20px;" value="${p.instruments.join(', ')}">

      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">보유 장비 (Gear)</label>
      <input type="text" id="edit-gear" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 20px;" value="${p.gear}">

      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">선호 장르 (쉼표로 구분)</label>
      <input type="text" id="edit-genre" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 30px;" value="${p.favGenres.join(', ')}">

      <button class="btn-primary w-100" onclick="window.saveProfileInfo(this.closest('.modal-backdrop'))">저장하기</button>
      <button class="btn-secondary w-100 mt-20" onclick="this.closest('.modal-backdrop').remove()">취소</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.saveProfileInfo = (modalEl) => {
  if (!DB.userProfile) DB.userProfile = { handle: '@user_handle' };
  DB.userProfile.name = modalEl.querySelector('#edit-name').value;
  DB.userProfile.bio = modalEl.querySelector('#edit-bio').value;
  DB.userProfile.instruments = modalEl.querySelector('#edit-inst').value.split(',').map(s=>s.trim()).filter(Boolean);
  DB.userProfile.gear = modalEl.querySelector('#edit-gear').value;
  DB.userProfile.favGenres = modalEl.querySelector('#edit-genre').value.split(',').map(s=>s.trim()).filter(Boolean);
  
  persistDB();
  modalEl.remove();
  
  const pageProfile = document.getElementById('page-profile');
  if (pageProfile && pageProfile.classList.contains('active')) {
    pageProfile.innerHTML = renderProfilePage();
  }
  window.showToast('프로필 정보가 안전하게 저장되었습니다!');
};

window.toggleDarkMode = (el) => {
  if (el.checked) {
    document.body.classList.remove('light-mode');
    localStorage.setItem('bandHarmonyThemeMode', 'dark');
  } else {
    document.body.classList.add('light-mode');
    localStorage.setItem('bandHarmonyThemeMode', 'light');
  }
};

window.changeThemeColor = (colorHex, glowRgba, secondaryHex) => {
  document.documentElement.style.setProperty('--accent-color', colorHex);
  document.documentElement.style.setProperty('--accent-glow', glowRgba);
  if (secondaryHex) document.documentElement.style.setProperty('--accent-secondary', secondaryHex);
  localStorage.setItem('bandHarmonyThemeColor', JSON.stringify({colorHex, glowRgba, secondaryHex}));
  
  const pageProfile = document.getElementById('page-profile');
  if (pageProfile && pageProfile.classList.contains('active')) {
    pageProfile.innerHTML = renderProfilePage();
  }
};

window.showThemeColorModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()">
      <h3 style="margin-bottom: 16px;">포인트 테마 색상 (Color)</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">앱 전반의 강조 색상을 원하시는 분위기로 바꿔보세요!</p>
      <div style="display: flex; gap: 16px; justify-content: center; margin-bottom: 32px; flex-wrap: wrap;">
        <button onclick="window.changeThemeColor('#9D4EDD', 'rgba(157, 78, 221, 0.3)', '#39FF14'); window.showToast('스튜디오 퍼플로 설정되었습니다.'); this.closest('.modal-backdrop').remove();" style="width:50px; height:50px; border-radius:25px; background:#9D4EDD; border:2px solid #FFF; cursor:pointer; box-shadow: 0 4px 12px rgba(157, 78, 221, 0.4);"></button>
        <button onclick="window.changeThemeColor('#00B4D8', 'rgba(0, 180, 216, 0.3)', '#FFD166'); window.showToast('오션 블루로 설정되었습니다.'); this.closest('.modal-backdrop').remove();" style="width:50px; height:50px; border-radius:25px; background:#00B4D8; border:2px solid #FFF; cursor:pointer; box-shadow: 0 4px 12px rgba(0, 180, 216, 0.4);"></button>
        <button onclick="window.changeThemeColor('#FF6D00', 'rgba(255, 109, 0, 0.3)', '#00E5FF'); window.showToast('선셋 오렌지로 설정되었습니다.'); this.closest('.modal-backdrop').remove();" style="width:50px; height:50px; border-radius:25px; background:#FF6D00; border:2px solid #FFF; cursor:pointer; box-shadow: 0 4px 12px rgba(255, 109, 0, 0.4);"></button>
        <button onclick="window.changeThemeColor('#EF233C', 'rgba(239, 35, 60, 0.3)', '#EDF2F4'); window.showToast('크림슨 레드로 설정되었습니다.'); this.closest('.modal-backdrop').remove();" style="width:50px; height:50px; border-radius:25px; background:#EF233C; border:2px solid #FFF; cursor:pointer; box-shadow: 0 4px 12px rgba(239, 35, 60, 0.4);"></button>
        <button onclick="window.changeThemeColor('#01FFC3', 'rgba(1, 255, 195, 0.3)', '#FF2A6D'); window.showToast('네온 민트로 설정되었습니다.'); this.closest('.modal-backdrop').remove();" style="width:50px; height:50px; border-radius:25px; background:#01FFC3; border:2px solid #FFF; cursor:pointer; box-shadow: 0 4px 12px rgba(1, 255, 195, 0.4);"></button>
      </div>
      <button class="btn-secondary w-100" onclick="this.closest('.modal-backdrop').remove()">닫기</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.showLanguageModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()">
      <h3 style="margin-bottom: 20px;">언어 설정 (Language)</h3>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
        <button class="btn-secondary w-100" style="background: rgba(157, 78, 221, 0.2); border-color: var(--accent-color); color: white;" onclick="this.closest('.modal-backdrop').remove(); window.showToast('한국어로 정상적으로 설정되었습니다.');">한국어 (Korean)</button>
        <button class="btn-secondary w-100" onclick="this.closest('.modal-backdrop').remove(); window.showToast('App language successfully changed to English.');">English</button>
        <button class="btn-secondary w-100" onclick="this.closest('.modal-backdrop').remove(); window.showToast('日本語に設定されました。');">日本語 (Japanese)</button>
      </div>
      <button class="btn-secondary w-100" onclick="this.closest('.modal-backdrop').remove()">닫기</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

// --- Page Renderers ---

const renderHomePage = () => {
  const p = DB.userProfile || defaultDB.userProfile;
  return `
    <div class="home-hero" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
      <div>
        <p style="font-size: 14px; color: var(--accent-secondary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;">Welcome back</p>
        <h1 style="font-size: 32px; font-weight: 800; line-height: 1.1; letter-spacing: -0.5px;">안녕하세요,<br><span style="color: var(--accent-color);">${p.name.split(' ')[0]}</span>님.</h1>
      </div>
      <div class="user-avatar-wrapper" style="width: 56px; height: 56px; margin: 0; box-shadow: 0 0 20px rgba(157, 78, 221, 0.4);">
        <div class="user-avatar" style="width: 100%; height: 100%; border: 2px solid var(--accent-color); background: var(--surface-light);"><i class="ph-fill ph-user" style="font-size: 28px;"></i></div>
      </div>
    </div>

    <!-- Block 1: Dynamic Metrics -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 36px;">
      <div class="glass-panel" style="padding: 20px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
        <div style="position: absolute; top: -10px; right: -10px; font-size: 80px; opacity: 0.05; color: var(--accent-color); pointer-events: none;"><i class="ph-fill ph-calendar-check"></i></div>
        <p style="font-size: 36px; font-weight: 800; color: white; line-height: 1; margin-bottom: 8px;">3<span style="font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-left: 6px;">건</span></p>
        <p style="font-size: 13px; color: var(--accent-secondary); font-weight: 600;">다가오는 밴드 일정</p>
      </div>
      <div class="glass-panel" style="padding: 20px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; background: linear-gradient(135deg, rgba(30,30,40,0.8), rgba(157,78,221,0.15)); border: 1px solid rgba(157,78,221,0.3);">
        <div style="position: absolute; top: -10px; right: -10px; font-size: 80px; opacity: 0.05; color: var(--inst-vocal); pointer-events: none;"><i class="ph-fill ph-chat-circle-text"></i></div>
        <p style="font-size: 36px; font-weight: 800; color: white; line-height: 1; margin-bottom: 8px;">12<span style="font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-left: 6px;">개</span></p>
        <p style="font-size: 13px; color: var(--inst-vocal); font-weight: 600;">새로운 피드 코멘트</p>
      </div>
    </div>

    <!-- Block 2: Upcoming Schedules Focus -->
    <div class="home-block" style="margin-bottom: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">이번 주 일정</h2>
        <span style="color: var(--accent-color); font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 4px;" onclick="document.querySelector('.nav-item[data-target=\\'calendar\\']').click()">캘린더 열기</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${DB.schedules.slice(0, 2).map(item => {
          let dDayStr = 'D-Day';
          let borderAccent = 'rgba(255, 255, 255, 0.1)';
          let monthStr = '';
          let dateStr = '';
          let diffDays = 1;
          if (item.date) {
            const evDate = new Date(item.date);
            const todayD = new Date();
            todayD.setHours(0,0,0,0);
            evDate.setHours(0,0,0,0);
            diffDays = Math.ceil((evDate - todayD) / (1000 * 60 * 60 * 24));
            if (diffDays > 0) dDayStr = 'D-' + diffDays;
            else if (diffDays === 0) { dDayStr = 'D-Day'; borderAccent = 'var(--inst-vocal)'; }
            else dDayStr = '종료';
            
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthStr = months[evDate.getMonth()];
            dateStr = String(evDate.getDate()).padStart(2, '0');
          }
          return `
          <div class="schedule-card glass-panel" style="display: flex; align-items: center; padding: 16px; cursor: pointer; position: relative; overflow: hidden; border-left: 4px solid ${borderAccent};" onclick="window.showEventDetailModal('${item.date}', '${item.venue.replace(/'/g, "\\'")}')">
            <!-- 좌측 날짜 블록 -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 60px; border-right: 1px solid var(--stroke-color); padding-right: 16px; margin-right: 16px;">
              <span style="color: var(--accent-color); font-size: 13px; font-weight: 700; text-transform: uppercase;">${monthStr}</span>
              <span style="font-size: 26px; font-weight: 800; color: var(--text-primary); line-height: 1; margin: 2px 0;">${dateStr}</span>
            </div>
            
            <!-- 우측 상세 정보 블록 -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="badge" style="font-size: 11px; color: ${diffDays === 0 ? 'var(--inst-vocal)' : 'var(--text-primary)'}; font-weight: 700; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 6px;">${dDayStr}</span>
                <span class="card-type" style="font-size: 12px; color: var(--accent-secondary); font-weight: 600; text-transform: uppercase;">${item.type}</span>
              </div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; line-height: 1.2;">${item.venue}</h3>
              <p style="color: var(--text-secondary); font-size: 13px; margin: 0; display: flex; align-items: center; gap: 4px;"><i class="ph-fill ph-clock" style="color: var(--accent-color);"></i> ${item.time}</p>
            </div>
            
            <div style="color: var(--text-secondary); opacity: 0.3;">
              <i class="ph-bold ph-caret-right" style="font-size: 20px;"></i>
            </div>
          </div>
        `}).join('')}
      </div>
    </div>

    <!-- Block 3: VIP Focus Feedback -->
    <div class="home-block" style="margin-bottom: 80px;">
      <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px; letter-spacing: -0.5px;">최근 리뷰 노트</h2>
      <div class="glass-panel feedback-card" style="position: relative; padding: 24px; border-radius: 20px; background: linear-gradient(145deg, rgba(20,20,25,0.7) 0%, rgba(30,30,40,0.4) 100%);">
        <i class="ph-fill ph-quotes" style="position: absolute; top: 16px; left: 16px; font-size: 40px; color: rgba(255,255,255,0.05);"></i>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-left: 24px;">
          <div class="user-avatar-wrapper" style="width: 32px; height: 32px; margin: 0;">
            <div class="user-avatar" style="width: 100%; height: 100%; background: var(--surface-light);"><i class="ph-fill ph-user" style="font-size: 16px;"></i></div>
          </div>
          <div>
            <strong style="font-size: 14px; display: block; color: var(--text-primary);">Manager Kim</strong>
            <small style="color: rgba(255,255,255,0.4); font-size: 12px;">1시간 전</small>
          </div>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: var(--text-secondary); padding-left: 12px; border-left: 2px solid var(--accent-secondary); margin-bottom: 0;">"오늘 런 너무 좋았습니다! 다음 롤링홀 공연을 대비해서 코러스 파트의 템포를 아주 조금만 낮춰보죠. 고생하셨습니다."</p>
        <button class="btn-primary w-100" style="margin-top: 24px; display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 15px;" onclick="document.querySelector('.nav-item[data-target=\\'feed\\']').click()">
          <i class="ph ph-video-camera" style="font-size: 20px;"></i> 연습 피드로 이동
        </button>
      </div>
    </div>
  `;
};

const renderCalendarPage = () => {
  const y = calDate.getFullYear();
  const m = calDate.getMonth();
  
  const firstDay = new Date(y, m, 1).getDay(); // 0(Sun) - 6(Sat)
  const startEmpty = firstDay === 0 ? 6 : firstDay - 1; // Mon = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  
  const today = new Date();
  
  let daysHtml = '';
  // Empty blocks
  for(let i=0; i<startEmpty; i++) {
    daysHtml += `<div class="cal-date empty"></div>`;
  }
  
  // Days
  for(let i=1; i<=daysInMonth; i++) {
    const dStr = `${y}-${String(m+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    let hasEvent = DB.schedules.some(s => s.date === dStr) ? '<div class="cal-dot"></div>' : '';
    let active = (today.getFullYear() === y && today.getMonth() === m && today.getDate() === i) ? 'active-date' : '';
    daysHtml += `<div class="cal-date ${active}" onclick="window.handleDateSelect('${dStr}', this)">${i}${hasEvent}</div>`;
  }
  
  const currentViewDateStr = `${y}-${String(m+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  return `
    <div class="calendar-header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <button onclick="window.changeMonth(-1)" style="background:none; border:none; color:var(--text-primary); cursor:pointer; padding: 8px;">
        <i class="ph ph-caret-left" style="font-size: 24px;"></i>
      </button>
      <h1 style="margin: 0; font-size: 22px;">${y}년 ${m+1}월</h1>
      <button onclick="window.changeMonth(1)" style="background:none; border:none; color:var(--text-primary); cursor:pointer; padding: 8px;">
         <i class="ph ph-caret-right" style="font-size: 24px;"></i>
      </button>
    </div>
    <div class="calendar-comp glass-panel">
      <div class="calendar-weeks">
        <div class="cal-day">월</div><div class="cal-day">화</div><div class="cal-day">수</div>
        <div class="cal-day">목</div><div class="cal-day">금</div><div class="cal-day">토</div><div class="cal-day">일</div>
        ${daysHtml}
      </div>
    </div>

    <div id="calendar-details-container" class="date-details mt-40">
      ${renderDateDetails(currentViewDateStr)}
    </div>
  `;
};

const renderFeedPage = () => {
  return `
    <div class="feed-header">
      <h1>연습 피드</h1>
    </div>

    <div class="search-bar">
      <input type="text" id="feed-search-input" placeholder="세션, 태그, 멤버 검색..." onkeypress="if(event.key === 'Enter') window.executeSearch(null)">
      <button onclick="window.executeSearch(null)" style="background: none; border: none; cursor: pointer; padding: 4px; display: flex;">
        <i class="ph ph-magnifying-glass" style="color: var(--text-secondary); font-size: 20px; transition: color var(--transition-fast);"></i>
      </button>
    </div>
    
    <div class="trending-tags">
      <span class="tag-pill active" onclick="window.executeSearch('')">#전체</span>
      <span class="tag-pill" onclick="window.executeSearch('#롤링홀 준비')">#롤링홀 준비</span>
      <span class="tag-pill" onclick="window.executeSearch('#보컬')">#보컬</span>
      <span class="tag-pill" onclick="window.executeSearch('#베이스')">#베이스</span>
      <span class="tag-pill" onclick="window.executeSearch('#자작곡')">#자작곡</span>
    </div>

    <div class="feed-list">
      ${DB.feed.map(item => `
        <div class="feed-card glass-panel">
          <div class="feed-user" style="position: relative;">
            <div class="user-avatar-wrapper">
              <div class="user-avatar"><i class="ph-fill ph-user"></i></div>
              <div class="online-indicator"></div>
            </div>
            <div>
              <strong>${item.user}</strong>
              <small>${item.time}</small>
            </div>
            ${(item.user === 'Alex V.' || item.user === 'Alex Vocalist') ? `
              <div style="position: absolute; right: 16px; top: 16px; display: flex; gap: 8px;">
                <button onclick="window.editFeedPost(${item.id})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; border-radius: 4px; transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)';" onmouseout="this.style.background='none';"><i class="ph ph-pencil-simple" style="font-size: 20px;"></i></button>
                <button onclick="window.deleteFeedPost(${item.id})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; border-radius: 4px; transition: 0.2s;" onmouseover="this.style.color='red'; this.style.background='rgba(255,0,0,0.1)';" onmouseout="this.style.color='var(--text-secondary)'; this.style.background='none';"><i class="ph ph-trash" style="font-size: 20px;"></i></button>
              </div>
            ` : ''}
          </div>
          <div class="feed-video-placeholder" style="background-image: url('${item.img}')">
             <div class="play-btn" onclick="this.style.color='var(--accent-secondary)';"><i class="ph-fill ph-play-circle"></i></div>
          </div>
          <div class="feed-content">
            <h3>${item.title}</h3>
            ${item.tags ? `<div class="feed-tags">${item.tags.map(t => `<span class="feed-tag-sm" onclick="window.executeSearch('${t}')">${t}</span>`).join('')}</div>` : ''}

            <div class="feed-stats">
              <span><i class="ph ph-eye"></i> ${item.views} 조회수</span>
              <span><i class="ph ph-chat-circle"></i> ${item.comments} 댓글</span>
            </div>
          </div>
          <div class="feed-actions">
            <button class="action-btn" onclick="window.toggleLike(this, ${item.id})" style="color: ${item.liked ? 'var(--inst-vocal)' : 'var(--text-secondary)'}">
              <i class="${item.liked ? 'ph-fill ph-heart' : 'ph ph-heart'}" style="color: ${item.liked ? 'var(--inst-vocal)' : ''}"></i> 좋아요
            </button>
            <button class="action-btn" onclick="window.showCommentsModal(${item.id})"><i class="ph ph-chat-circle"></i> 댓글 작성</button>
            <button class="action-btn" onclick="window.showShareModal(${item.id})"><i class="ph ph-share-network"></i> 공유</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

const renderProfilePage = () => {
  const p = DB.userProfile || defaultDB.userProfile;
  return `
    <div class="profile-header" style="position:relative;">
      <button onclick="window.showEditProfileModal()" style="position:absolute; top: 0; right: 0; background:none; border:none; color: var(--text-secondary); cursor: pointer; transition: color var(--transition-bounce);">
        <i class="ph ph-gear" style="font-size: 28px;"></i>
      </button>

      <div class="avatar-large">
        <i class="ph-fill ph-user"></i>
      </div>
      <h1>${p.name}</h1>
      <p>${p.handle}</p>
    </div>

    <div class="profile-section glass-panel mt-40" style="padding: 24px;">
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">소개 및 다짐</h3>
        <p style="font-size: 15px; line-height: 1.6; color: var(--text-primary);">${p.bio}</p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">사용 악기 / 포지션</h3>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${p.instruments.map(inst => `<span class="tag-pill" style="margin: 0;">${inst}</span>`).join('')}
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">보유 장비 (Gear)</h3>
        <p style="font-size: 15px; color: var(--accent-secondary);"><i class="ph ph-headphones" style="margin-right:4px;"></i>${p.gear}</p>
      </div>
      
      <div>
        <h3 style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">선호 장르</h3>
        <p style="font-size: 15px; color: var(--text-primary);">${p.favGenres.join(', ')}</p>
      </div>
    </div>

    <div class="profile-section glass-panel mt-20">
      <div class="settings-row" style="margin-bottom: 16px;">
        <span>다크 모드 (Dark Theme)</span>
        <label class="toggle-switch">
          <input type="checkbox" onchange="window.toggleDarkMode(this)" ${document.body.classList.contains('light-mode') ? '' : 'checked'}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="settings-row" style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); cursor: pointer; margin-bottom: 16px;" onclick="window.showThemeColorModal()">
        <span>앱 테마 색상 (Colors)</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; border-radius: 10px; background: var(--accent-color); border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 0 8px var(--accent-glow);"></div>
          <i class="ph ph-caret-right" style="color: var(--text-secondary);"></i>
        </div>
      </div>
      <div class="settings-row" style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); margin-bottom: 16px;">
        <span>새 피드백 푸시 알림</span>
        <label class="toggle-switch">
          <input type="checkbox" checked>
          <span class="slider"></span>
        </label>
      </div>
      <div class="settings-row" style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); cursor: pointer;" onclick="window.showLanguageModal()">
        <span>앱 표시 언어 (Language)</span>
        <div style="display: flex; align-items: center; color: var(--text-secondary); gap: 8px;">
          <span style="font-size: 14px;">한국어 (KR)</span>
          <i class="ph ph-caret-right"></i>
        </div>
      </div>
      <div class="settings-row" style="padding-top: 16px; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);">
        <span>앱 버전 (Version)</span>
        <span style="font-size: 14px; color: var(--text-tertiary);">1.0.2 안정화 베타</span>
      </div>
    </div>

    <div class="auth-buttons mt-40" style="margin-bottom: 80px;">
      <button class="btn-secondary w-100" onclick="alert('로그아웃 되었습니다')">로그아웃</button>
    </div>
  `;
};

// --- App Initialization & Navigation ---

const appInit = () => {
  // 로컬 스토리지 기반 테마 세팅 초기화
  const savedThemeMode = localStorage.getItem('bandHarmonyThemeMode');
  if (savedThemeMode === 'light') document.body.classList.add('light-mode');

  const savedThemeColor = localStorage.getItem('bandHarmonyThemeColor');
  if (savedThemeColor) {
    try {
      const theme = JSON.parse(savedThemeColor);
      document.documentElement.style.setProperty('--accent-color', theme.colorHex);
      document.documentElement.style.setProperty('--accent-glow', theme.glowRgba);
      if(theme.secondaryHex) document.documentElement.style.setProperty('--accent-secondary', theme.secondaryHex);
    } catch(e) {}
  }

  const mainContent = document.getElementById('main-content');
  const navItems = document.querySelectorAll('.nav-item');

  const fab = document.createElement('div');
  fab.className = 'fab';
  fab.id = 'fab-upload';
  fab.innerHTML = '<i class="ph ph-upload-simple"></i>';
  fab.onclick = window.showUploadModal;
  fab.style.display = 'none';
  document.querySelector('.app-container').appendChild(fab);

  // Page structure holder
  const pages = {
    home: document.createElement('div'),
    calendar: document.createElement('div'),
    feed: document.createElement('div'),
    profile: document.createElement('div')
  };

  // Initialize Pages
  Object.keys(pages).forEach(key => {
    pages[key].className = 'page';
    pages[key].id = `page-${key}`;
    mainContent.appendChild(pages[key]);
  });

  // Render contents
  pages.home.innerHTML = renderHomePage();
  pages.calendar.innerHTML = renderCalendarPage();
  pages.feed.innerHTML = renderFeedPage();
  pages.profile.innerHTML = renderProfilePage();

  // Navigation Logic
  let activePage = null;

  const switchPage = (target) => {
    // Nav Items Update
    navItems.forEach(item => {
      const icon = item.querySelector('i');
      if (item.dataset.target === target) {
        item.classList.add('active');
        const baseClass = icon.className.split(' ').find(c => c.startsWith('ph-') && c !== 'ph-fill');
        if (baseClass) icon.className = `ph-fill ${baseClass}`;
      } else {
        item.classList.remove('active');
        const baseClass = icon.className.split(' ').find(c => c.startsWith('ph-') && c !== 'ph-fill');
        if (baseClass) icon.className = `ph ${baseClass}`;
      }
    });

    // Page Transition
    if (activePage && activePage !== target) {
      pages[activePage].classList.remove('active');
    }
    
    // Allow tiny dom buffer for re-render display flex transition
    setTimeout(() => {
      pages[target].classList.add('active');
    }, 10);

    fab.style.display = (target === 'feed') ? 'flex' : 'none';

    mainContent.scrollTo(0, 0);
    activePage = target;
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if(activePage !== item.dataset.target) {
        switchPage(item.dataset.target);
      }
    });
  });

  // Init First Page
  switchPage('home');
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', appInit);
