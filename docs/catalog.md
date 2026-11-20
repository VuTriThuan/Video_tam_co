# Catalog khối dựng Tâm Cơ
> Sinh tự động từ `render/thu-vien/khoi.js`, không sửa tay. Agent chỉ được dùng đúng các tên dưới đây; cần khối mới thì ghi vào `"de_xuat_khoi"`.

## Cấu trúc một cảnh (canh.json)
```json
{"id":"c05","loi":"câu đọc","chu":"chữ nhấn ≤6 từ hoặc \"\"","tu_khoa":"từ trong chu để tô đỏ","bo_cuc":"<bo_cuc>","nen":"<nen>","goc_may":"<goc_may>",
 "so":1,
 "nhan_vat":[{"vai":"minh","tu_the":"dung","bieu_cam":"buon","vi_tri":"giua","co":"lon|vua|nho","hang":"sau","lat":false,
   "vao":"nhay|tu-duoi|tu-trai|tu-phai|di-vao|co-san","t":0.1,
   "doi":[{"t":0.5,"tu_the":"om-dau","bieu_cam":"ngac-nhien","quay":true}],"noi_gia":false}],
 "xep":"<xep, tùy chọn>",
 "dao_cu":[{"ten":"dau-hoi","vi_tri":"dau-0","t":0.4,"het":0.9,"den":"tay-1","noi_dung":"giay","ben":"trai"}],
 "man_hinh":{"loai":"nhom-chat","ten":"Cả Phòng Mình","thanh_vien":12,"thieu":"Mình","t_thieu":0.6},
 "hieu_ung":[{"ten":"vong-tron-do","muc_tieu":"man-hinh","t":0.7}],
 "sfx":["whoosh","thud"]}
```
- Mọi `t`, `het` là **tỷ lệ của câu đọc** (0 = đầu câu, 1 = cuối câu). Bỏ trống thì tự xếp lệch nhau.
- `nhan_vat` thứ tự = thứ tự vẽ; nhân vật `minh` tự mấp máy miệng theo giọng.
- Đạo cụ chỉ cần tên: `"dao_cu":["dong-ho","chuong"]` cũng được (tự đặt vị trí).

## bo_cuc
- `hook-chu-to`: Mở đầu: nền mạnh, chữ nhấn đập to, nhân vật bật lên sau ~1 giây
- `nhan-vat-ke`: Nhân vật dẫn chuyện kể, có thể kèm đồng nghiệp và đạo cụ
- `nhan-vat-va-dong-nghiep`: Tương tác giữa các nhân vật (2–4 người)
- `dien-thoai`: Màn hình lớn ở giữa (xem man_hinh), nhân vật nhỏ góc dưới
- `dau-hieu-so`: Số thứ tự to (trường "so") + chữ nhấn + minh họa
- `so-sanh`: Chia đôi khung: nhân vật có "ben": "trai" | "phai"
- `loi-khuyen`: Lời khuyên: số nhỏ (trường "so", tùy chọn) + chữ + nhân vật + đạo cụ
- `dong-thoi-gian`: Dòng thời gian: trục dọc giữa khung, tối đa 4 mốc so le trái/phải; mỗi mốc lần lượt bật một hình nhỏ (vai hoặc dao_cu) + thẻ nhãn đỏ + 1 dòng chữ ngắn, đoạn trục đỏ "giăng" dần tới mốc mới. Tham số "moc": [{"nhan","nd","hinh","t"}] — "nhan" ≤3 từ, "nd" ≤6 từ, "hinh" là tên vai (vd "sep") hoặc dao_cu (vd "phong-bi"), hoặc {"vai","bieu_cam","tu_the"}; "t" bỏ trống thì tự chia đều. Không dùng nhan_vat/dao_cu ngoài (bị bỏ qua); hiệu ứng nhắm mốc bằng muc_tieu "moc-<k>". Dùng khi: chiêu được giăng dần qua nhiều thời điểm ("Thứ 2… tuần sau… tháng sau"), kể lại chuỗi bước leo thang; thay cho nhan-vat-ke khi lời đọc là một trình tự. Không dùng khi: chỉ có 1 thời điểm, các bước không theo thời gian (dùng dau-hieu-so), hoặc chữ nội dung mỗi mốc dài hơn 6 từ. Vd {"bo_cuc":"dong-thoi-gian","chu":"Chiêu giăng từ từ","tu_khoa":"từ từ","nen":"trung","moc":[{"nhan":"Thứ 2","nd":"Khen bạn trước cả phòng","hinh":{"vai":"sep","bieu_cam":"cuoi"},"t":0.1},{"nhan":"Tuần sau","nd":"Nhờ làm thêm chút việc","hinh":"tai-lieu","t":0.35},{"nhan":"Tháng sau","nd":"Việc thêm thành việc chính","hinh":"dong-ho","t":0.6}]}
- `ket`: Cảnh kết: logo, tên kênh, nút theo dõi

## vai
- `minh`: nhân vật dẫn chuyện (áo đỏ), miệng theo giọng
- `dong-nghiep-nam`: đồng nghiệp nam đeo kính
- `dong-nghiep-nu`: đồng nghiệp nữ tóc dài búi
- `dong-nghiep-nu-2`: đồng nghiệp nữ tóc ngắn
- `sep`: sếp nam, cà vạt đỏ
- `nhom`: cụm 3 đồng nghiệp đứng sát nhau

## tu_the
`dung`, `khoanh-tay`, `om-dau`, `chi-tay`, `chi-tay-trai`, `quay-lung`, `ngoi-ban`, `nhin-dien-thoai`, `gio-tay`, `vay-tay`, `thi-tham`, `nhun-vai`, `dang-tay`, `chong-cam`, `chong-hong`, `cam-do`

## bieu_cam
`binh-thuong`, `buon`, `ngac-nhien`, `suy-nghi`, `cuoi`, `lo-lang`

## vi_tri (nhân vật)
`trai-xa`, `trai`, `giua-trai`, `giua`, `giua-phai`, `phai`, `phai-xa`

## xep
- `hang-ngang`: mặc định: xếp ngang theo vi_tri / tự chia đều
- `doi-dien`: 2 người đối diện nhau
- `nhom-quay-lung`: mình đứng trước, những người khác hàng sau lần lượt quay lưng
- `tach-nhom`: cả nhóm túm tụm trong vòng tròn, mình đứng ngoài rìa trái
- `mot-minh-giua-dam-dong`: mình đứng giữa, xung quanh mọi người quay lưng

## nen (bắt buộc mỗi cảnh; dùng 2–4 bối cảnh mỗi video)
Bối cảnh:
- `van-phong-mo`: văn phòng mở: cửa sổ, kệ, dãy bàn xa
- `phong-hop`: phòng họp: bảng trắng, màn chiếu, ghế
- `pantry`: góc pantry/cà phê: tủ, máy pha, tủ lạnh
- `thang-may`: sảnh thang máy: cửa kim loại, đèn số tầng
- `phong-sep`: phòng sếp: cửa kính lớn, tủ sách, bàn lớn
- `quan-ca-phe`: quán cà phê ngoài giờ: đèn treo, quầy, bàn tròn
- `o-nha-toi`: ở nhà buổi tối: cửa sổ trăng, sofa, đèn cây
Nền trừu tượng: `trung`, `dau-hieu`, `loi-khuyen`, `chia-doi`, `man-hinh`, `burst`, `van-phong`, `toi`, `soi-day`
Nền đặc biệt (khi nào dùng):
- `soi-day`: Sợi Dây Vô Hình: hàng nghìn sợi mảnh trôi lên, bị 3 điểm hút ẩn kéo thành xoáy đỏ, một số sợi thoát ra màu sáng. Dùng cho cảnh mở / hook / kết của chủ đề thao túng, người giật dây, kiểm soát ngầm. Tối đa 1–3 cảnh mỗi video; hợp với hook-chu-to, nhan-vat-ke, loi-khuyen. Hình tất định theo video.seed.

## goc_may (bắt buộc mỗi cảnh; ≥3 loại mỗi video)
- `can`: cận mặt nhân vật chính
- `trung`: trung (mặc định)
- `toan`: toàn cảnh, lùi xa
- `tu-tren`: nhìn từ trên xuống
- `qua-vai`: qua vai một người ở tiền cảnh

## tong_mau (một cho cả video, ghi trong video.json)
`hoang-hon`, `dem-xanh`, `sang-xam`, `mua-tim`, `binh-minh`, `den-vang`

## video.json
`{"chu_de":"ten-ngan-khong-dau","tong_mau":"<tong_mau>","seed":<số nguyên ≥1 — đổi bộ đồng nghiệp/sếp>,"bia":{"chu":"CHỮ ẢNH BÌA 3–6 TỪ","tu_khoa":"TỪ TÔ ĐỎ"}}`

## Biến thể
- `"bien_the": 2` trên một nhân vật: tư thế biến thể (nghiêng người, tay khác).

## dao_cu
`dien-thoai`, `laptop`, `dong-ho`, `chuong`, `kinh-lup`, `dau-hoi`, `dau-than`, `ngoi-sao`, `tai-lieu`, `coc-ca-phe`, `mat-trang`, `phong-bi`, `lich`, `ban-hop`, `cua`, `tim`, `bieu-do`, `nghen`, `cham-lung`, `ban-lam-viec`, `bong-noi`
- Vị trí đạo cụ: `tren-trai`, `tren-phai`, `tren-giua`, `giua-trai`, `giua-phai`, `giua`, `dau-<k>`, `tay-<k>`, `ban`, hoặc `[x, y]` (khung 1080×1920).
- `bong-noi` nhận `noi_dung`: `giay`, `khoa`, `cuoi-tuan`, `haha`, `sao`, `cham`. `laptop` nhận `man`: `tai-lieu` | `trong` | `bieu-do`.

## man_hinh (loai và tham số)
- `nhom-chat`: ten, thanh_vien (số, hiện lưới thành viên đếm dần), thieu (tên người bị thiếu), tin: [{ai, nd | icon | anh, t}]
- `tin-nhan-rieng`: ten, tin: [{ai: "minh" | tên, nd, t}]
- `thong-bao`: ten, dong, t — thông báo bật lên góc màn hình trên nền tài liệu
- `tai-lieu`: tieu_de
- `email`: tu, tieu_de
- `lich-hop`: tieu_de, gio_cu, gio_moi, t (lúc gạch giờ cũ)
- `tin` trong `nhom-chat`: `{"ai":"chi","nd":"Tối nay đi lẩu nha","t":0.3}`, `{"ai":"anh","icon":"tim"}`, `{"ai":"chi","anh":"lau","nd":"chú thích"}`. `ai`: `minh` (bên phải) hoặc `chi|anh|em|sep`.

## hieu_ung
- `vong-tron-do`: khoanh tròn đỏ quanh muc_tieu
- `gach-cheo`: gạch chéo đỏ lên muc_tieu
- `tick`: dấu tick xanh cạnh muc_tieu
- `so-thu-tu`: huy hiệu số (so) tại vi_tri
- `mui-ten`: mũi tên cong từ "tu" đến "den"
- `rung`: rung cả khung tại t
- `zoom-vao`: phóng to dần từ t
- `den-roi`: đèn rọi: cảnh tối dần, vòng sáng mềm rọi "tu" (hoặc muc_tieu); có "den" thì trượt sang "den" (t_den tuỳ chọn). Dùng cho khoảnh khắc lật mặt, vd {"ten":"den-roi","tu":"nv-0","den":"nv-1","t":0.5}
- `to-da-quang`: vệt bút dạ quang nét tay quét trái → phải (0,4 s) dưới đúng từ "tu" trong chu (bỏ trống = tu_khoa); kieu "to" (vệt dày, mặc định) | "gach-duoi". Dùng khi: câu chốt/lời khuyên có một từ "đinh" ("im lặng", "ranh giới"). Không dùng khi: chữ dài quá 2 dòng, hoặc cảnh đã có vong-tron-do / gach-cheo. Vd {"ten":"to-da-quang","tu":"ranh giới","t":0.4,"kieu":"to"}
- `gach-thay`: chữ cũ "cu" bị gạch tay 2 lần, mờ đi và tụt xuống, chữ thật "moi" bật lên ngay cạnh; THAY cho chu thường của cảnh (vẫn ghi chu = moi). Dùng khi: lật mặt kiểu "tưởng là… hoá ra…", sửa một niềm tin sai. Không dùng khi: cần gạch nhân vật/đồ vật (dùng gach-cheo), hoặc moi dài hơn cu quá nhiều. Vd {"ten":"gach-thay","cu":"Sếp khen bạn","moi":"Sếp đang thử bạn","t":0.35}
- `dung-hinh`: cảnh khựng lại tại t, chớp sáng ngắn, co thành tấm ảnh viền giấy nghiêng "nghieng" độ (mặc định -2), 2 miếng băng dính, nhãn viết tay "nhan". Dùng khi: hook ("dừng lại ở đây") hoặc đúng lúc lật mặt, để nhìn kỹ một chi tiết. Không dùng khi: cảnh thoại dồn dập, hoặc cảnh liền trước vừa dùng zoom-vao / rung. Vd {"ten":"dung-hinh","t":0.5,"nhan":"Khoảnh khắc này","nghieng":-2}
- `muc_tieu`: "man-hinh" | "nv-<k>" (nhân vật thứ k, đếm từ 0) | "dc-<k>" (đạo cụ thứ k) | "moc-<k>" (hình của mốc thứ k trong dong-thoi-gian) | tên vị trí | [x, y]

## sfx
`whoosh`, `swoosh-nhe`, `pop`, `ding`, `tick`, `tin-nhan`, `thud` (tối đa 2 mỗi cảnh; có thể ghi `{"ten":"thud","t":0.7}`)
