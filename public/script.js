// Menangkap elemen-elemen DOM
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const clearChatBtn = document.getElementById('clear-chat');
const presetSelector = document.getElementById('preset-selector');
const systemPromptInput = document.getElementById('system-prompt');
const temperatureInput = document.getElementById('temperature');
const tempValLabel = document.getElementById('temp-val');
const typingIndicator = document.getElementById('typing-indicator');

// Variabel Penampung Riwayat Percakapan
let conversationHistory = [];

// Preset System Instructions untuk kemudahan pengujian kustomisasi
const presets = {
  asisten: "Kamu adalah asisten AI yang ramah, sopan, dan suka membantu pengguna.",
  finansial: "Kamu adalah penasihat keuangan dan edukator finansial profesional yang ahli. Jawab pertanyaan pengguna dengan analogi sederhana dan edukatif, namun ingatkan untuk tetap melakukan riset mandiri (DYOR).",
  travel: "Kamu adalah travel planner dan tour guide lokal berpengalaman. Bantu merencanakan perjalanan, merekomendasikan tempat tersembunyi yang indah, kuliner lezat, dan estimasi rute perjalanan.",
  coding: "Kamu adalah mentor pemrograman senior yang sabar. Bantu jelaskan kode langkah-demi-langkah, tunjukkan di mana letak bug dalam kode pengguna, dan berikan contoh cara memperbaikinya."
};

// Update label temperatur secara real-time saat slider digeser
temperatureInput.addEventListener('input', (e) => {
  tempValLabel.textContent = e.target.value;
});

// Ubah system instruction secara otomatis ketika preset diganti
presetSelector.addEventListener('change', (e) => {
  const selectedPreset = e.target.value;
  if (presets[selectedPreset]) {
    systemPromptInput.value = presets[selectedPreset];
  }
});

// Fungsi untuk me-render bubble pesan baru di layar
function appendMessage(role, text) {
  const flexContainer = document.createElement('div');
  flexContainer.className = 'flex gap-3 max-w-3xl ' + (role === 'user' ? 'ml-auto justify-end' : '');

  // Render HTML bubble pesan
  const bubbleHTML = role === 'user' 
    ? `
      <div class="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-md text-sm">
        <p>${escapeHTML(text)}</p>
      </div>
    `
    : `
      <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">AI</div>
      <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm text-slate-700 markdown-body">
        ${marked.parse(text)}
      </div>
    `;

  flexContainer.innerHTML = bubbleHTML;
  chatMessages.appendChild(flexContainer);
  
  // Auto-scroll area percakapan ke bagian terbawah
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fungsi pembantu untuk sanitasi teks input user agar aman dari eksploitasi XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Handle pengiriman form chat
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const text = userInput.value.trim();
  if (!text) return;

  // Tampilkan pesan pengguna di layar UI
  appendMessage('user', text);
  
  // Masukkan pesan ke dalam array riwayat percakapan lokal
  conversationHistory.push({ role: 'user', text: text });
  
  // Kosongkan kolom input
  userInput.value = '';
  
  // Tampilkan indikator loading mengetik
  typingIndicator.classList.remove('hidden');
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    // Ambil data konfigurasi dinamis dari sidebar
    const systemPrompt = systemPromptInput.value;
    const temperature = temperatureInput.value;

    // Lakukan request POST asinkron menggunakan fetch ke backend Express
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation: conversationHistory,
        temperature: temperature,
        systemInstruction: systemPrompt
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Server mengalami masalah.');
    }

    const data = await response.json();
    
    // Tampilkan respons AI di layar UI
    appendMessage('bot', data.result);
    
    // Simpan respons bot ke riwayat percakapan agar Gemini ingat konteks di turn berikutnya
    conversationHistory.push({ role: 'bot', text: data.result });

  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    appendMessage('bot', '⚠️ *Maaf, gagal memproses respons.* Hubungan ke backend terputus atau kunci API salah.');
  } finally {
    // Sembunyikan kembali indikator mengetik
    typingIndicator.classList.add('hidden');
  }
});

// Tombol hapus histori percakapan
clearChatBtn.addEventListener('click', () => {
  if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat percakapan?')) {
    conversationHistory = [];
    chatMessages.innerHTML = `
      <div class="flex gap-3 max-w-3xl">
        <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">AI</div>
        <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm text-slate-700">
          <p>Histori telah dibersihkan. Ada topik percakapan baru yang ingin kita mulai? 😊</p>
        </div>
      </div>
    `;
  }
});
