-- MAJOR STORE / Supabase setup
-- Run this whole script in Supabase Dashboard > SQL Editor.
-- It creates shared products/settings/orders/messages and safe RLS policies
-- and seeds the cloud store with the default MAJOR STORE catalog.

create extension if not exists pgcrypto;

create table if not exists public.store_data (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  name text not null,
  phone text not null,
  email text,
  address text,
  payment text,
  note text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric default 0,
  coupon text,
  total numeric default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  visitor_name text not null,
  visitor_email text,
  message text not null,
  reply text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  replied_at timestamptz
);

-- Seed row: the same catalog the store ships with (12 products, 8 categories, 3 coupons).
insert into public.store_data (id, data)
values ('main', '{"products":[{"id":"p1","category":"distros","name":{"ar":"Kali Linux Pro 2026","en":"Kali Linux Pro 2026"},"price":18,"oldPrice":25,"badge":{"ar":"الأكثر مبيعاً","en":"Best seller"},"specs":{"ar":"600+ أداة مثبتة","en":"600+ tools pre-installed"},"icon":"🐉","color":"#0d2235","stock":25,"description":{"ar":"توزيعة Kali Linux مع 600+ أداة اختراق مثبتة، تشمل Metasploit، Burp، Nmap، Wireshark.","en":"Kali Linux with 600+ hacking tools pre-installed: Metasploit, Burp, Nmap, Wireshark."},"rating":4.9,"reviews":412},{"id":"p2","category":"distros","name":{"ar":"Parrot Security OS 6.0","en":"Parrot Security OS 6.0"},"price":15,"oldPrice":0,"badge":{"ar":"مستقر","en":"Stable"},"specs":{"ar":"توزيعة خفيفة ومرنة","en":"Lightweight & flexible"},"icon":"🦜","color":"#0d3520","stock":18,"description":{"ar":"توزيعة باروت للأمن السيبراني، مناسبة للاختبار الاحترافي والمحاكاة السحابية.","en":"Parrot OS for cybersecurity, ideal for pro pentesting and cloud labs."},"rating":4.7,"reviews":156},{"id":"p3","category":"exploit","name":{"ar":"Metasploit Pro - رخصة سنوية","en":"Metasploit Pro - 1 Year"},"price":65,"oldPrice":90,"badge":{"ar":"احترافي","en":"Pro"},"specs":{"ar":"12 شهراً تحديث","en":"12 months updates"},"icon":"💀","color":"#2a0a1a","stock":6,"description":{"ar":"إطار عمل Metasploit الكامل لاختبار الاختراق (نسخة تعليمية مرخصة) + تحديثات لمدة 12 شهراً.","en":"Full Metasploit framework for pentesting (educational license) + 12 months of updates."},"rating":5,"reviews":89},{"id":"p4","category":"web","name":{"ar":"Burp Suite Professional","en":"Burp Suite Professional"},"price":89,"oldPrice":0,"badge":{"ar":"للويب","en":"Web"},"specs":{"ar":"Scanner متقدم","en":"Advanced scanner"},"icon":"🌐","color":"#1a0d35","stock":4,"description":{"ar":"أداة اختبار تطبيقات الويب الأشهر عالمياً مع Scanner متقدم وتحديثات سنوية.","en":"The web penetration testing tool of choice worldwide, with advanced Scanner & yearly updates."},"rating":4.9,"reviews":234},{"id":"p5","category":"wireless","name":{"ar":"WiFi Pineapple Mark VII","en":"WiFi Pineapple Mark VII"},"price":140,"oldPrice":165,"badge":{"ar":"للشبكات","en":"Network"},"specs":{"ar":"جاهز للاستعمال","en":"Ready to use"},"icon":"📡","color":"#0d2438","stock":3,"description":{"ar":"جهاز اختبار اختراق الشبكات اللاسلكية الاحترافي مع واجهة Pineapple UI.","en":"Pro wireless pentesting device with Pineapple UI ready to operate."},"rating":4.8,"reviews":67},{"id":"p6","category":"courses","name":{"ar":"دورة OSCP الكاملة","en":"Full OSCP Course"},"price":32,"oldPrice":0,"badge":{"ar":"تعليمي","en":"Educational"},"specs":{"ar":"PDF + LABs + CTF","en":"PDF + LABs + CTF"},"icon":"🎓","color":"#1d2611","stock":99,"description":{"ar":"دورة شاملة لإعداد شهادة OSCP: منهجية PDF + LAB + CTF.","en":"Full course to prepare OSCP certification: PDF + LABs + CTF."},"rating":4.9,"reviews":512},{"id":"p7","category":"courses","name":{"ar":"Hacking: The Art of Exploitation","en":"Hacking: The Art of Exploitation"},"price":13,"oldPrice":16,"badge":{"ar":"كلاسيكي","en":"Classic"},"specs":{"ar":"نسخة عربية","en":"AR + EN edition"},"icon":"📕","color":"#1d2611","stock":42,"description":{"ar":"الكتاب الكلاسيكي لتعلم الاختراق الأخلاقي وفهم استغلال الثغرات بعمق.","en":"Classic book to master ethical hacking & exploit development in depth."},"rating":4.8,"reviews":178},{"id":"p8","category":"osint","name":{"ar":"Maltego Community","en":"Maltego Community"},"price":0,"oldPrice":0,"badge":{"ar":"مجاني","en":"Free"},"specs":{"ar":"مفتوح المصدر","en":"Open source"},"icon":"🔍","color":"#0e1d2a","stock":999,"description":{"ar":"أداة OSINT لتحليل العلاقات بين البيانات والمعلومات. النسخة المجانية.","en":"OSINT tool to analyze relationships between data. Free Community edition."},"rating":4.7,"reviews":91},{"id":"p9","category":"malware","name":{"ar":"ANY.RUN Sandbox","en":"ANY.RUN Sandbox"},"price":56,"oldPrice":0,"badge":{"ar":"تحليل","en":"Analysis"},"specs":{"ar":"3 أشهر","en":"3 months"},"icon":"🦠","color":"#231510","stock":12,"description":{"ar":"بيئة رملية سحابية لتحليل البرمجيات الخبيثة بأمان - 3 أشهر.","en":"Cloud sandbox for safely analyzing malware — 3 months subscription."},"rating":4.9,"reviews":56},{"id":"p10","category":"tools","name":{"ar":"Hashcat Pro (GPU)","en":"Hashcat Pro (GPU)"},"price":36,"oldPrice":42,"badge":{"ar":"GPU","en":"GPU"},"specs":{"ar":"NVIDIA/AMD","en":"NVIDIA/AMD"},"icon":"🔐","color":"#1a1a0d","stock":20,"description":{"ar":"أداة كسر كلمات المرور الأسرع في العالم مع جداول محدّثة.","en":"World''s fastest password cracker with up-to-date hash tables."},"rating":4.8,"reviews":145},{"id":"p11","category":"wireless","name":{"ar":"Aircrack-ng Suite","en":"Aircrack-ng Suite"},"price":11,"oldPrice":0,"badge":{"ar":"متوفر","en":"Available"},"specs":{"ar":"Win/Linux","en":"Win/Linux"},"icon":"🛜","color":"#0d2438","stock":33,"description":{"ar":"حزمة Aircrack-ng الكاملة لاختبار الشبكات اللاسلكية.","en":"Full Aircrack-ng suite for wireless network testing."},"rating":4.6,"reviews":88},{"id":"p12","category":"courses","name":{"ar":"دورة CEH v12","en":"CEH v12 Course"},"price":45,"oldPrice":58,"badge":{"ar":"محدّث","en":"Updated"},"specs":{"ar":"عربي + امتحان","en":"AR + practice exam"},"icon":"📚","color":"#1d2611","stock":50,"description":{"ar":"دورة CEH v12 عربي: محاضرات + LABs + امتحان تدريبي.","en":"CEH v12 in Arabic: video lectures + LABs + practice exam."},"rating":4.9,"reviews":367}],"categories":[{"id":"distros","name":{"ar":"توزيعات لينكس","en":"Linux distros"},"icon":"🐧","color":"#0a2a1f"},{"id":"wireless","name":{"ar":"WiFi والشبكة","en":"WiFi & network"},"icon":"📡","color":"#0d2438"},{"id":"web","name":{"ar":"اختبار تطبيقات الويب","en":"Web pentesting"},"icon":"🌐","color":"#1a0d35"},{"id":"exploit","name":{"ar":"إطارات الاختراق","en":"Exploit frameworks"},"icon":"💀","color":"#2a0a1a"},{"id":"courses","name":{"ar":"دورات وكتب","en":"Courses & books"},"icon":"📚","color":"#1d2611"},{"id":"malware","name":{"ar":"تحليل برمجيات خبيثة","en":"Malware analysis"},"icon":"🦠","color":"#231510"},{"id":"osint","name":{"ar":"أدوات OSINT","en":"OSINT tools"},"icon":"🔍","color":"#0e1d2a"},{"id":"tools","name":{"ar":"برامج مساعدة","en":"Utility tools"},"icon":"🛠","color":"#1a1a0d"}],"settings":{"brand":"MAJOR STORE","brandSubtitle":{"ar":"أدوات اختراق وبرامج إلكترونية","en":"Hacking tools & electronic programs"},"announcement":{"ar":"⚡ دورة الاختراق الأخلاقي الكاملة بخصم 30% — لفترة محدودة","en":"⚡ Full Ethical Hacking course 30% off — limited time"},"announcementEnabled":true,"heroBadge":{"ar":"Ethical Hacking · Penetration Testing","en":"Ethical Hacking · Penetration Testing"},"heroTitle":{"ar":"أدوات||الاختراق الأخلاقي||وبرامج الأمن السيبراني","en":"Ethical Hacking||Tools||& Cybersecurity Programs"},"heroText":{"ar":"توزيعات لينكس احترافية، أدوات اختبار اختراق، بيئات تدريب افتراضية، وكتب منهجية للمحترفين والطلاب. كل شيء تحتاجه في مكان واحد.","en":"Professional Linux distros, pentesting tools, training labs and methodology books. Everything you need in one place."},"heroCta":{"ar":"تصفح المنتجات","en":"Browse products"},"heroSecondary":{"ar":"انضم للديسكورد","en":"Join Discord"},"heroStats":[{"ar":{"value":"500+","label":"عميل محترف"},"en":{"value":"500+","label":"Pro clients"}},{"ar":{"value":"99.9%","label":"ضمان المنتجات"},"en":{"value":"99.9%","label":"Product guarantee"}},{"ar":{"value":"24/7","label":"دعم تقني"},"en":{"value":"24/7","label":"Tech support"}}],"phone":"+213 770 12 34 56","whatsapp":"213770123456","email":"support@majorstore.dz","address":{"ar":"الجزائر","en":"Algeria"},"instagram":"@majorstore.dz","footerText":{"ar":"أدوات قوية، اختيار ذكي.","en":"Cybersecurity tools for professionals."},"currency":"$","currencyCode":"USD","paymentMethods":["Bitcoin (BTC)","Ethereum (ETH)","USDT (TRC20)","USDT (ERC20)","Litecoin (LTC)","Monero (XMR)","PayPal","Visa / Mastercard","Western Union","Wise (TransferWise)","BaridiMob / CCP","الدفع عند الاستلام"],"discordLink":"https://discord.gg/WrK7ttvq5g"},"coupons":[{"code":"MAJOR10","type":"percent","value":10,"active":true},{"code":"WELCOME5","type":"fixed","value":5,"active":true},{"code":"CRYPTO15","type":"percent","value":15,"active":true}]}
'::jsonb)
on conflict (id) do nothing;

alter table public.store_data enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;

-- Remove old policies if this script is re-run.
drop policy if exists store_public_read on public.store_data;
drop policy if exists store_admin_write on public.store_data;
drop policy if exists orders_public_insert on public.orders;
drop policy if exists orders_admin_read on public.orders;
drop policy if exists orders_admin_update on public.orders;
drop policy if exists orders_admin_delete on public.orders;
drop policy if exists messages_public_insert on public.messages;
drop policy if exists messages_admin_read on public.messages;
drop policy if exists messages_admin_update on public.messages;
drop policy if exists messages_admin_delete on public.messages;

-- Public visitors may read the store and create orders/messages.
create policy store_public_read on public.store_data
  for select to anon, authenticated using (true);

create policy orders_public_insert on public.orders
  for insert to anon, authenticated with check (true);

create policy messages_public_insert on public.messages
  for insert to anon, authenticated with check (length(message) between 1 and 3000);

-- Only authenticated Supabase users can manage store, orders and messages.
create policy store_admin_write on public.store_data
  for all to authenticated using (true) with check (true);

create policy orders_admin_read on public.orders
  for select to authenticated using (true);

create policy orders_admin_update on public.orders
  for update to authenticated using (true) with check (true);

create policy orders_admin_delete on public.orders
  for delete to authenticated using (true);

create policy messages_admin_read on public.messages
  for select to authenticated using (true);

create policy messages_admin_update on public.messages
  for update to authenticated using (true) with check (true);

create policy messages_admin_delete on public.messages
  for delete to authenticated using (true);

-- After running this SQL, create the admin user in:
-- Authentication > Users > Add user
-- Email: admin@majorstore.store
-- Password: yemavava91@@@@#####
