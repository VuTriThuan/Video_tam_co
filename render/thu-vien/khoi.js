/* Thư viện khối dựng Tâm Cơ — NGUỒN DUY NHẤT về tên khối.
 * docs/catalog.md và render/thu-vien/ten-khoi.json được sinh từ file này (node render/thu-vien/xuat-catalog.mjs).
 * Mỗi khối vẽ bằng bộ nét P của phong cách (net-co-ban.js), nên dùng được ở cả 3 phong cách.
 */
(function (g) {
  const TV = {};

  TV.BO_CUC = {
    'hook-chu-to': 'Mở đầu: nền mạnh, chữ nhấn đập to, nhân vật bật lên sau ~1 giây',
    'nhan-vat-ke': 'Nhân vật dẫn chuyện kể, có thể kèm đồng nghiệp và đạo cụ',
    'nhan-vat-va-dong-nghiep': 'Tương tác giữa các nhân vật (2–4 người)',
    'dien-thoai': 'Màn hình lớn ở giữa (xem man_hinh), nhân vật nhỏ góc dưới',
    'dau-hieu-so': 'Số thứ tự to (trường "so") + chữ nhấn + minh họa',
    'so-sanh': 'Chia đôi khung: nhân vật có "ben": "trai" | "phai"',
    'loi-khuyen': 'Lời khuyên: số nhỏ (trường "so", tùy chọn) + chữ + nhân vật + đạo cụ',
    'ket': 'Cảnh kết: logo, tên kênh, nút theo dõi',
  };

  // vai → kiểu vẽ trong net-co-ban.js
  TV.VAI = {
    'minh': { ve: 'minh', mo_ta: 'nhân vật dẫn chuyện (áo đỏ), miệng theo giọng' },
    'dong-nghiep-nam': { ve: 'anh', mo_ta: 'đồng nghiệp nam đeo kính' },
    'dong-nghiep-nu': { ve: 'chi', mo_ta: 'đồng nghiệp nữ tóc dài búi' },
    'dong-nghiep-nu-2': { ve: 'em', mo_ta: 'đồng nghiệp nữ tóc ngắn' },
    'sep': { ve: 'sep', mo_ta: 'sếp nam, cà vạt đỏ' },
    'nhom': { ve: 'nhom', mo_ta: 'cụm 3 đồng nghiệp đứng sát nhau' },
  };
  // tư thế → tư thế tay (TC.TU_THE) + cờ đặc biệt
  TV.TU_THE = {
    'dung': { tay: 'xuoi' }, 'khoanh-tay': { tay: 'khoanh' }, 'om-dau': { tay: 'om-dau' },
    'chi-tay': { tay: 'chi' }, 'chi-tay-trai': { tay: 'chi-trai' }, 'quay-lung': { tay: 'xuoi', quay: true },
    'ngoi-ban': { tay: 'cam-dt', ban: true }, 'nhin-dien-thoai': { tay: 'cam-dt', dienThoai: true },
    'gio-tay': { tay: 'dem' }, 'vay-tay': { tay: 'vay' }, 'thi-tham': { tay: 'thi-tham' },
    'nhun-vai': { tay: 'nhun-vai' }, 'dang-tay': { tay: 'giang' }, 'chong-cam': { tay: 'chong-cam' },
    'chong-hong': { tay: 'chong-hong' }, 'cam-do': { tay: 'cam-dt' },
  };
  TV.BIEU_CAM = ['binh-thuong', 'buon', 'ngac-nhien', 'suy-nghi', 'cuoi', 'lo-lang'];
  TV.VI_TRI = { 'trai-xa': 140, 'trai': 220, 'giua-trai': 380, 'giua': 540, 'giua-phai': 700, 'phai': 860, 'phai-xa': 940 };
  TV.VI_TRI_DAO_CU = {
    'tren-trai': [300, 760], 'tren-phai': [790, 760], 'tren-giua': [560, 680],
    'giua-trai': [250, 1050], 'giua-phai': [830, 1050], 'giua': [540, 1000],
    // 'dau-<k>' trên đầu nhân vật thứ k; 'tay-<k>' cạnh tay; 'ban' trên mặt bàn; hoặc [x, y]
  };
  TV.XEP = {
    'hang-ngang': 'mặc định: xếp ngang theo vi_tri / tự chia đều',
    'doi-dien': '2 người đối diện nhau',
    'nhom-quay-lung': 'mình đứng trước, những người khác hàng sau lần lượt quay lưng',
    'tach-nhom': 'cả nhóm túm tụm trong vòng tròn, mình đứng ngoài rìa trái',
    'mot-minh-giua-dam-dong': 'mình đứng giữa, xung quanh mọi người quay lưng',
  };
  // bối cảnh (≥7) + nền trừu tượng cho các bố cục đặc biệt
  TV.BOI_CANH = {
    'van-phong-mo': 'văn phòng mở: cửa sổ, kệ, dãy bàn xa', 'phong-hop': 'phòng họp: bảng trắng, màn chiếu, ghế',
    'pantry': 'góc pantry/cà phê: tủ, máy pha, tủ lạnh', 'thang-may': 'sảnh thang máy: cửa kim loại, đèn số tầng',
    'phong-sep': 'phòng sếp: cửa kính lớn, tủ sách, bàn lớn', 'quan-ca-phe': 'quán cà phê ngoài giờ: đèn treo, quầy, bàn tròn',
    'o-nha-toi': 'ở nhà buổi tối: cửa sổ trăng, sofa, đèn cây',
  };
  TV.NEN = [...Object.keys(TV.BOI_CANH), 'trung', 'dau-hieu', 'loi-khuyen', 'chia-doi', 'man-hinh', 'burst', 'van-phong', 'toi', 'soi-day'];
  // nền đặc biệt: khi nào nên dùng (in vào catalog)
  TV.NEN_DAC_BIET = {
    'soi-day': 'Sợi Dây Vô Hình: hàng nghìn sợi mảnh trôi lên, bị 3 điểm hút ẩn kéo thành xoáy đỏ, một số sợi thoát ra màu sáng. Dùng cho cảnh mở / hook / kết của chủ đề thao túng, người giật dây, kiểm soát ngầm. Tối đa 1–3 cảnh mỗi video; hợp với hook-chu-to, nhan-vat-ke, loi-khuyen. Hình tất định theo video.seed.',
  };
  TV.GOC_MAY = { 'can': 'cận mặt nhân vật chính', 'trung': 'trung (mặc định)', 'toan': 'toàn cảnh, lùi xa', 'tu-tren': 'nhìn từ trên xuống', 'qua-vai': 'qua vai một người ở tiền cảnh' };
  // tông màu chung cả video (giữ đen + đỏ thương hiệu, chỉ đổi tông nền)
  TV.TONG_MAU = {
    'hoang-hon': { nen: '#F6E3D3', nen2: '#EBCDB6', tuong: '#F2D7C2', kinh: '#FFD9A8', troi: ['#2A1636', '#8E2C3E', '#E76F51', '#F4A261'], giay: '#FBF3EA' },
    'dem-xanh': { nen: '#DCE3EE', nen2: '#C3CEDF', tuong: '#D3DCEA', kinh: '#2C3E66', troi: ['#060A1A', '#14204A', '#2C3E78', '#4A5F9E'], giay: '#F2F4F8' },
    'sang-xam': { nen: '#F3EFEF', nen2: '#E7DEDB', tuong: '#ECE6E4', kinh: '#DCE8F0', troi: ['#3A3D46', '#7D8290', '#B9BEC8', '#E4E6EA'], giay: '#FBF8F1' },
    'mua-tim': { nen: '#E7DFEE', nen2: '#D3C6E0', tuong: '#DDD2E8', kinh: '#9C8BC0', troi: ['#1E1430', '#3E2A5E', '#6B4F94', '#9C84C4'], giay: '#F6F2FA' },
    'binh-minh': { nen: '#FBE8EC', nen2: '#F3D2DA', tuong: '#F8DEE4', kinh: '#FFE1E8', troi: ['#3B2A4A', '#B0607A', '#F2A1B3', '#FFD8C9'], giay: '#FDF5F6' },
    'den-vang': { nen: '#F7EBCF', nen2: '#ECD8AC', tuong: '#F3E2BC', kinh: '#FFE7A6', troi: ['#231709', '#5C3A12', '#B57A2A', '#F2C46B'], giay: '#FCF6E6' },
  };
  // ngoại hình nhân vật phụ ráp từ tham số; Minh cố định
  TV.KIEU_TOC = { nam: ['ngan', 'dung', 'xoan-nam', 'vuot-nguoc'], nu: ['dai-bui', 'bob', 'duoi-ngua', 'dai-xoa', 'xoan-nu'], sep: ['hoi', 'vuot-nguoc'] };
  TV.MAU_AO = ['#8D99AE', '#5C677D', '#C9ADA7', '#6B8F71', '#B08968', '#7A6C9D', '#4F6D7A', '#D4A373'];
  TV.MAU_TOC = ['#1E1A18', '#3B2A22', '#4B3426', '#5A3E2B', '#2A2A2A'];
  TV.DANG = { gay: 0.88, vua: 1, dam: 1.16 };
  TV.ngoaiHinh = function (seed, vai, k) {
    if (!seed || vai === 'minh' || vai === 'nhom') return null; // seed 0 = bộ đồng nghiệp gốc
    let h = (seed * 2654435761 + (k + 1) * 40503 + vai.length * 97) >>> 0;
    const r = n => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) % n; };
    const gioi = vai === 'sep' ? 'sep' : (vai.includes('nu') ? 'nu' : 'nam');
    const ds = TV.KIEU_TOC[gioi];
    return {
      toc: ds[r(ds.length)], mauToc: gioi === 'sep' && r(2) ? '#9A9A9A' : TV.MAU_TOC[r(TV.MAU_TOC.length)],
      ao: vai === 'sep' ? ['#2B2D42', '#3D405B', '#4A4E69'][r(3)] : TV.MAU_AO[r(TV.MAU_AO.length)],
      kinh: r(3) === 0 || vai === 'sep', dang: Object.keys(TV.DANG)[r(3)],
    };
  };


  // đạo cụ: tên → cách vẽ (P, o) ; o.t = thời gian cảnh
  const ic = (ten, s = 1) => (P, o) => P.icon(ten, { t: o.t, s: s * (o.co || 1) });
  TV.DAO_CU = {
    'dien-thoai': ic('dien-thoai'), 'laptop': (P, o) => P.laptop({ s: 0.85 * (o.co || 1), man: o.man || 'tai-lieu', t: o.t }),
    'dong-ho': (P, o) => P.icon('dong-ho', { t: o.t, s: o.co || 1, quay: o.nhanh }), 'chuong': ic('chuong'), 'kinh-lup': ic('kinh-lup'),
    'dau-hoi': ic('dau-hoi', 1.1), 'dau-than': ic('cham-than'), 'ngoi-sao': ic('sao', 1.1), 'tai-lieu': ic('tai-lieu'),
    'coc-ca-phe': ic('ca-phe'), 'mat-trang': ic('mat-trang'), 'phong-bi': ic('phong-bi'), 'lich': ic('lich'),
    'ban-hop': ic('ban-hop'), 'cua': ic('cua'), 'tim': ic('tim'), 'bieu-do': ic('bieu-do'), 'nghen': ic('nghen'),
    'cham-lung': ic('cham'),
    'ban-lam-viec': null, // vẽ riêng như đồ nội thất phía trước nhân vật
    'bong-noi': (P, o) => P.bong({ w: o.w || 220, h: o.h || 150, noiDung: o.noi_dung || 'cham', ben: o.ben || 'trai', t: o.t }),
  };
  TV.NOI_DUNG_BONG = ['giay', 'khoa', 'cuoi-tuan', 'haha', 'sao', 'cham'];

  // màn hình: loai → tham số (nội dung truyền qua tham số, không viết cứng)
  TV.MAN_HINH = {
    'nhom-chat': 'ten, thanh_vien (số, hiện lưới thành viên đếm dần), thieu (tên người bị thiếu), tin: [{ai, nd | icon | anh, t}]',
    'tin-nhan-rieng': 'ten, tin: [{ai: "minh" | tên, nd, t}]',
    'thong-bao': 'ten, dong, t — thông báo bật lên góc màn hình trên nền tài liệu',
    'tai-lieu': 'tieu_de',
    'email': 'tu, tieu_de',
    'lich-hop': 'tieu_de, gio_cu, gio_moi, t (lúc gạch giờ cũ)',
  };
  TV.HIEU_UNG = {
    'vong-tron-do': 'khoanh tròn đỏ quanh muc_tieu',
    'gach-cheo': 'gạch chéo đỏ lên muc_tieu',
    'tick': 'dấu tick xanh cạnh muc_tieu',
    'so-thu-tu': 'huy hiệu số (so) tại vi_tri',
    'mui-ten': 'mũi tên cong từ "tu" đến "den"',
    'rung': 'rung cả khung tại t',
    'zoom-vao': 'phóng to dần từ t',
    'den-roi': 'đèn rọi: cảnh tối dần, vòng sáng mềm rọi "tu" (hoặc muc_tieu); có "den" thì trượt sang "den" (t_den tuỳ chọn). Dùng cho khoảnh khắc lật mặt, vd {"ten":"den-roi","tu":"nv-0","den":"nv-1","t":0.5}',
    'to-da-quang': 'vệt bút dạ quang nét tay quét trái → phải (0,4 s) dưới đúng từ "tu" trong chu (bỏ trống = tu_khoa); kieu "to" (vệt dày, mặc định) | "gach-duoi". Dùng khi: câu chốt/lời khuyên có một từ "đinh" ("im lặng", "ranh giới"). Không dùng khi: chữ dài quá 2 dòng, hoặc cảnh đã có vong-tron-do / gach-cheo. Vd {"ten":"to-da-quang","tu":"ranh giới","t":0.4,"kieu":"to"}',
    'gach-thay': 'chữ cũ "cu" bị gạch tay 2 lần, mờ đi và tụt xuống, chữ thật "moi" bật lên ngay cạnh; THAY cho chu thường của cảnh (vẫn ghi chu = moi). Dùng khi: lật mặt kiểu "tưởng là… hoá ra…", sửa một niềm tin sai. Không dùng khi: cần gạch nhân vật/đồ vật (dùng gach-cheo), hoặc moi dài hơn cu quá nhiều. Vd {"ten":"gach-thay","cu":"Sếp khen bạn","moi":"Sếp đang thử bạn","t":0.35}',
    'dung-hinh': 'cảnh khựng lại tại t, chớp sáng ngắn, co thành tấm ảnh viền giấy nghiêng "nghieng" độ (mặc định -2), 2 miếng băng dính, nhãn viết tay "nhan". Dùng khi: hook ("dừng lại ở đây") hoặc đúng lúc lật mặt, để nhìn kỹ một chi tiết. Không dùng khi: cảnh thoại dồn dập, hoặc cảnh liền trước vừa dùng zoom-vao / rung. Vd {"ten":"dung-hinh","t":0.5,"nhan":"Khoảnh khắc này","nghieng":-2}',
  };
  TV.MUC_TIEU = '"man-hinh" | "nv-<k>" (nhân vật thứ k, đếm từ 0) | "dc-<k>" (đạo cụ thứ k) | tên vị trí | [x, y]';
  TV.SFX = ['whoosh', 'swoosh-nhe', 'pop', 'ding', 'tick', 'tin-nhan', 'thud'];

  g.TV = TV;
})(typeof window !== 'undefined' ? window : globalThis);
