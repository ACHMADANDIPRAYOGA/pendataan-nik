// ===========================
// DATA MANAGEMENT
// ===========================

class DataManager {
  constructor() {
    this.data = this.loadFromLocalStorage();
    this.renderData();
    this.setupEventListeners();
  }

  loadFromLocalStorage() {
    const stored = localStorage.getItem("dataRegistry");
    return stored ? JSON.parse(stored) : [];
  }

  saveToLocalStorage() {
    localStorage.setItem("dataRegistry", JSON.stringify(this.data));
  }

  addData(nama, nik, alamat, nominal) {
    const newEntry = {
      id: Date.now(),
      nama: nama.trim(),
      nik: nik.trim(),
      alamat: alamat.trim(),
      nominal: parseInt(nominal),
      tanggalInput: new Date().toLocaleString("id-ID"),
    };

    this.data.unshift(newEntry);
    this.saveToLocalStorage();
    return newEntry;
  }

  deleteData(id) {
    this.data = this.data.filter((item) => item.id !== id);
    this.saveToLocalStorage();
  }

  deleteAll() {
    if (
      confirm(
        "⚠️ Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!"
      )
    ) {
      this.data = [];
      this.saveToLocalStorage();
      this.renderData();
      this.showNotification("Semua data berhasil dihapus!", "warning");
    }
  }

  searchData(query) {
    if (!query.trim()) {
      return this.data;
    }

    const lowerQuery = query.toLowerCase();
    return this.data.filter(
      (item) =>
        item.nama.toLowerCase().includes(lowerQuery) ||
        item.nik.includes(query) ||
        item.alamat.toLowerCase().includes(lowerQuery)
    );
  }

  getFilteredData(searchQuery) {
    return searchQuery ? this.searchData(searchQuery) : this.data;
  }

  // ===========================
  // RENDERING
  // ===========================

  renderData() {
    const tableBody = document.getElementById("tableBody");
    const emptyMessage = document.getElementById("emptyMessage");
    const totalCount = document.getElementById("totalCount");

    totalCount.textContent = this.data.length;

    if (this.data.length === 0) {
      tableBody.innerHTML = "";
      emptyMessage.classList.add("show");
      return;
    }

    emptyMessage.classList.remove("show");
    tableBody.innerHTML = this.data
      .map(
        (item, index) => `
            <tr>
                <td class="no-col"><strong>${index + 1}</strong></td>
                <td>${this.escapeHtml(item.nama)}</td>
                <td><strong>${item.nik}</strong></td>
                <td>${this.escapeHtml(item.alamat)}</td>
                <td>${this.formatCurrency(item.nominal)}</td>
                <td>${item.tanggalInput}</td>
                <td>
                    <button class="btn btn-delete" onclick="dataManager.deleteDataHandler(${
                      item.id
                    })">
                        🗑️ Hapus
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  deleteDataHandler(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      this.deleteData(id);
      this.renderData();
      this.showNotification("Data berhasil dihapus!", "success");
    }
  }

  // ===========================
  // EVENT LISTENERS
  // ===========================

  setupEventListeners() {
    // Form submission
    document.getElementById("dataForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const nama = document.getElementById("nama").value;
      const nik = document.getElementById("nik").value;
      const alamat = document.getElementById("alamat").value;
      const nominal = document.getElementById("nominal").value;

      if (this.validateInput(nama, nik)) {
        this.addData(nama, nik, alamat, nominal);
        this.renderData();
        document.getElementById("dataForm").reset();
        this.showNotification("✓ Data berhasil ditambahkan!", "success");
        document.getElementById("nama").focus();
      }
    });

    // Search functionality
    document.getElementById("searchInput").addEventListener("input", (e) => {
      const query = e.target.value;
      const filteredData = this.searchData(query);
      this.renderFilteredData(filteredData);
    });

    // Export buttons
    document
      .getElementById("exportExcel")
      .addEventListener("click", () => this.exportToExcel());
    document
      .getElementById("exportPDF")
      .addEventListener("click", () => this.exportToPDF());
    document
      .getElementById("exportWord")
      .addEventListener("click", () => this.exportToWord());
    document
      .getElementById("deleteAll")
      .addEventListener("click", () => this.deleteAll());
  }

  renderFilteredData(filteredData) {
    const tableBody = document.getElementById("tableBody");
    const emptyMessage = document.getElementById("emptyMessage");

    if (filteredData.length === 0) {
      tableBody.innerHTML = "";
      emptyMessage.classList.add("show");
      emptyMessage.textContent =
        "🔍 Tidak ada data yang cocok dengan pencarian Anda.";
      return;
    }

    emptyMessage.classList.remove("show");
    tableBody.innerHTML = filteredData
      .map(
        (item, index) => `
            <tr>
                <td class="no-col"><strong>${index + 1}</strong></td>
                <td>${this.escapeHtml(item.nama)}</td>
                <td><strong>${item.nik}</strong></td>
                <td>${this.escapeHtml(item.alamat)}</td>
                <td>${this.formatCurrency(item.nominal)}</td>
                <td>${item.tanggalInput}</td>
                <td>
                    <button class="btn btn-delete" onclick="dataManager.deleteDataHandler(${
                      item.id
                    })">
                        🗑️ Hapus
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  validateInput(nama, nik) {
    if (!nama.trim()) {
      this.showNotification("❌ Nama tidak boleh kosong!", "danger");
      return false;
    }

    if (nama.trim().length < 3) {
      this.showNotification("❌ Nama minimal 3 karakter!", "danger");
      return false;
    }

    if (!nik.match(/^\d{16}$/)) {
      this.showNotification("❌ NIK harus 16 digit angka!", "danger");
      return false;
    }

    const nikExists = this.data.some((item) => item.nik === nik);
    if (nikExists) {
      this.showNotification("⚠️ NIK sudah terdaftar!", "warning");
      return false;
    }

    return true;
  }

  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // ===========================
  // EXPORT FUNCTIONS
  // ===========================

  exportToExcel() {
    if (this.data.length === 0) {
      this.showNotification("❌ Tidak ada data untuk diunduh!", "danger");
      return;
    }

    const dataWithNo = this.data.map((item, index) => ({
      No: index + 1,
      Nama: item.nama,
      NIK: item.nik,
      Alamat: item.alamat,
      "Nominal (Rp)": item.nominal,
      "Tanggal Input": item.tanggalInput,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataWithNo);
    const workbook = XLSX.utils.book_new();

    // Set column widths
    worksheet["!cols"] = [
      { wch: 5 }, // No
      { wch: 25 }, // Nama
      { wch: 18 }, // NIK
      { wch: 30 }, // Alamat
      { wch: 15 }, // Nominal
      { wch: 20 }, // Tanggal Input
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Penduduk");
    XLSX.writeFile(workbook, `Data_Penduduk_${this.getTimestamp()}.xlsx`);
    this.showNotification("✓ Berhasil mengunduh file Excel!", "success");
  }

  exportToPDF() {
    if (this.data.length === 0) {
      this.showNotification("❌ Tidak ada data untuk diunduh!", "danger");
      return;
    }

    const htmlContent = this.generatePDFHTML();
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    element.style.display = "none";
    document.body.appendChild(element);

    const options = {
      margin: 10,
      filename: `Data_Penduduk_${this.getTimestamp()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(element);
        this.showNotification("✓ Berhasil mengunduh file PDF!", "success");
      });
  }

  exportToWord() {
    if (this.data.length === 0) {
      this.showNotification("❌ Tidak ada data untuk diunduh!", "danger");
      return;
    }

    const table = this.generateWordTable();
    const html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Data Penduduk</title>
            </head>
            <body>
                <h1 style="text-align: center; color: #333;">📋 Laporan Data Penduduk</h1>
                <p style="text-align: center; color: #666;">Dicetak pada: ${new Date().toLocaleString(
                  "id-ID"
                )}</p>
                <p style="text-align: center; color: #666;">Total Data: ${
                  this.data.length
                }</p>
                ${table}
            </body>
            </html>
        `;

    const blob = new Blob([html], { type: "application/vnd.ms-word" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Data_Penduduk_${this.getTimestamp()}.doc`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.showNotification("✓ Berhasil mengunduh file Word!", "success");
  }

  generatePDFHTML() {
    let html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="text-align: center; color: #333; margin-bottom: 5px;">📋 Laporan Data Penduduk</h1>
                <p style="text-align: center; color: #666; margin-bottom: 20px;">
                    Dicetak pada: ${new Date().toLocaleString("id-ID")}<br>
                    Total Data: ${this.data.length}
                </p>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background-color: #667eea; color: white;">
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">No</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nama</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">NIK</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Alamat</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nominal (Rp)</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tanggal Input</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    this.data.forEach((item, index) => {
      html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;"><strong>${
                      index + 1
                    }</strong></td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${this.escapeHtml(
                      item.nama
                    )}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;"><strong>${
                      item.nik
                    }</strong></td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${this.escapeHtml(
                      item.alamat
                    )}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatCurrency(
                      item.nominal
                    )}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      item.tanggalInput
                    }</td>
                </tr>
            `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        `;

    return html;
  }

  generateWordTable() {
    let table = `
            <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #667eea; color: white;">
                        <th style="border: 1px solid #999; padding: 10px; text-align: center; font-weight: bold;">No</th>
                        <th style="border: 1px solid #999; padding: 10px; text-align: left; font-weight: bold;">Nama</th>
                        <th style="border: 1px solid #999; padding: 10px; text-align: center; font-weight: bold;">NIK</th>
                        <th style="border: 1px solid #999; padding: 10px; text-align: left; font-weight: bold;">Alamat</th>
                        <th style="border: 1px solid #999; padding: 10px; text-align: right; font-weight: bold;">Nominal (Rp)</th>
                        <th style="border: 1px solid #999; padding: 10px; text-align: left; font-weight: bold;">Tanggal Input</th>
                    </tr>
                </thead>
                <tbody>
        `;

    this.data.forEach((item, index) => {
      table += `
                <tr>
                    <td style="border: 1px solid #999; padding: 10px; text-align: center;"><strong>${
                      index + 1
                    }</strong></td>
                    <td style="border: 1px solid #999; padding: 10px;">${this.escapeHtml(
                      item.nama
                    )}</td>
                    <td style="border: 1px solid #999; padding: 10px; text-align: center;"><strong>${
                      item.nik
                    }</strong></td>
                    <td style="border: 1px solid #999; padding: 10px;">${this.escapeHtml(
                      item.alamat
                    )}</td>
                    <td style="border: 1px solid #999; padding: 10px; text-align: right;">${this.formatCurrency(
                      item.nominal
                    )}</td>
                    <td style="border: 1px solid #999; padding: 10px;">${
                      item.tanggalInput
                    }</td>
                </tr>
            `;
    });

    table += `
                </tbody>
            </table>
        `;

    return table;
  }

  getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}${month}${day}_${hours}${minutes}`;
  }

  // ===========================
  // NOTIFICATIONS
  // ===========================

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
        `;

    // Add CSS for notification
    if (!document.getElementById("notificationStyle")) {
      const style = document.createElement("style");
      style.id = "notificationStyle";
      style.innerHTML = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 24px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 600;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    animation: slideInRight 0.3s ease;
                    z-index: 9999;
                    max-width: 400px;
                }

                .notification-success {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .notification-danger {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }

                .notification-warning {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }

                .notification-info {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }

                .notification.hide {
                    animation: slideOutRight 0.3s ease;
                }

                @media (max-width: 480px) {
                    .notification {
                        left: 20px;
                        right: auto;
                        max-width: calc(100% - 40px);
                    }
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove notification
    setTimeout(() => {
      notification.classList.add("hide");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.dataManager = new DataManager();
});
