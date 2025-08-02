import { useState } from 'react';

// Header Component
export const Header = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-lg">Kamikaya</span>
        </div>
        <div className="text-sm">
          <span>Lebih banyak pilihan, lebih cepat disetujui</span>
        </div>
      </div>
    </div>
  );
};

// Loan Application Form Component
export const LoanApplicationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    loanAmount: '20000000',
    purpose: '',
    fullName: '',
    nik: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    income: '',
    ktpFile: null,
    selfieFile: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-b from-blue-600 to-purple-600 min-h-screen">
      {/* Header with loan amount */}
      <div className="text-center pt-8 pb-6">
        <div className="inline-block bg-white rounded-lg p-6 mx-4 shadow-lg w-full max-w-sm">
          <p className="text-gray-600 text-sm mb-2">💰 Pinjaman maksimal</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(formData.loanAmount)}</p>
          <div className="mt-4">
            <input
              type="range"
              min="1000000"
              max="50000000"
              step="1000000"
              value={formData.loanAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 Juta</span>
              <span>50 Juta</span>
            </div>
          </div>
          <button className="w-full bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg mt-4 hover:bg-yellow-500 transition-colors">
            NIKMATI LAYANAN
          </button>
        </div>
      </div>

      {/* Services Icons */}
      <div className="flex justify-center space-x-8 mb-8">
        <div className="text-center text-white">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-xl">💰</span>
          </div>
          <p className="text-xs">Tabungan</p>
        </div>
        <div className="text-center text-white">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-xl">📊</span>
          </div>
          <p className="text-xs">Pendanaan</p>
        </div>
        <div className="text-center text-white">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-xl">💎</span>
          </div>
          <p className="text-xs">Keuangan</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white min-h-screen rounded-t-3xl pt-6">
        <div className="px-6">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`w-3 h-3 rounded-full ${
                    step >= num ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-center mb-6">APA ITU KSP ?</h2>
              <div className="text-gray-600 text-sm leading-relaxed mb-6">
                <p>KamiKaya adalah platform layanan keuangan lokal, yang menyediakan pengguna terdaftar dengan Layanan keuangan yang aman dan nyaman, tanpa rekening bank Layanan rumah tangga dan keuangan. Dengan bantuan gotong royong antar anggota, KamiKaya memungkinkan pengguna Indonesia untuk membuka rekening dari jauh dan menggunakan emas Layanan keuangan.</p>
              </div>
              
              <h3 className="text-lg font-bold text-center mb-4">🔍 VISI KAMI</h3>
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span>Tingkatkan keanggotaan dan pendapatan sosial.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span>Mengembangkan kesadaran publik tentang aktivitas berbasis dalam kehidupan.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span>Meningkatkan kemandirian ekonomi antar anggota.</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-center mb-4">APA YANG BISA KAMI LAKUKAN?</h3>
              <div className="text-sm text-gray-600 mb-6">
                Menyediakan pembiayaan untuk anggota dan anggota keluarga lainnya, termasuk Isi ulang ponsel, pinjaman hipotek emas, pembelian komoditas multiguna, modal ventura, modal pertanian, hipotek emas multiguna kendaraan, mobil dan sepeda motor
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Mulai Pengajuan
              </button>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-center mb-6">Data Pribadi</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan NIK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Kembali
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Lanjut
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Financial Information */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-center mb-6">Informasi Keuangan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih pekerjaan</option>
                    <option value="karyawan">Karyawan Swasta</option>
                    <option value="pns">PNS</option>
                    <option value="wiraswasta">Wiraswasta</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="pensiunan">Pensiunan</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penghasilan per Bulan</label>
                  <select
                    name="income"
                    value={formData.income}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih range penghasilan</option>
                    <option value="1-3">Rp 1-3 Juta</option>
                    <option value="3-5">Rp 3-5 Juta</option>
                    <option value="5-10">Rp 5-10 Juta</option>
                    <option value="10-20">Rp 10-20 Juta</option>
                    <option value="20+">Di atas Rp 20 Juta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Pinjaman</label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih tujuan pinjaman</option>
                    <option value="modal_usaha">Modal Usaha</option>
                    <option value="renovasi">Renovasi Rumah</option>
                    <option value="pendidikan">Pendidikan</option>
                    <option value="kesehatan">Kesehatan</option>
                    <option value="konsumtif">Kebutuhan Konsumtif</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Kembali
                </button>
                <button 
                  onClick={() => setStep(4)}
                  className="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Lanjut
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Document Upload */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-center mb-6">Upload Dokumen</h2>
              <div className="space-y-6">
                {/* KTP Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Upload KTP</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'ktpFile')}
                      className="hidden"
                      id="ktp-upload"
                    />
                    <label htmlFor="ktp-upload" className="cursor-pointer">
                      {formData.ktpFile ? (
                        <div>
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-green-600 text-2xl">✓</span>
                          </div>
                          <p className="text-sm text-green-600">{formData.ktpFile.name}</p>
                        </div>
                      ) : (
                        <div>
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-gray-400 text-2xl">📄</span>
                          </div>
                          <p className="text-sm text-gray-600">Klik untuk upload KTP</p>
                          <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Selfie Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Upload Foto Selfie dengan KTP</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'selfieFile')}
                      className="hidden"
                      id="selfie-upload"
                    />
                    <label htmlFor="selfie-upload" className="cursor-pointer">
                      {formData.selfieFile ? (
                        <div>
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-green-600 text-2xl">✓</span>
                          </div>
                          <p className="text-sm text-green-600">{formData.selfieFile.name}</p>
                        </div>
                      ) : (
                        <div>
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-gray-400 text-2xl">🤳</span>
                          </div>
                          <p className="text-sm text-gray-600">Klik untuk upload selfie</p>
                          <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="terms" className="mt-1" />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      Saya menyetujui <span className="text-blue-600 underline">syarat dan ketentuan</span> serta <span className="text-blue-600 underline">kebijakan privasi</span> KamiKaya
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button 
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Kembali
                </button>
                <button 
                  onClick={() => {
                    alert('Pengajuan pinjaman berhasil disubmit! Tim kami akan menghubungi Anda dalam 1x24 jam.');
                    setStep(1);
                  }}
                  className="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Submit Pengajuan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};