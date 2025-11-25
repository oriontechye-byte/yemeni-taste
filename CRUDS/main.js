// main.js

// 1. استدعاء العناصر من صفحة HTML وحفظها في متغيرات للتحكم بها
let title = document.getElementById('title');
let price = document.getElementById('price');
let taxes = document.getElementById('taxes');
let ads = document.getElementById('ads');
let discount = document.getElementById('discount');
let total = document.getElementById('total');
let count = document.getElementById('count');
let category = document.getElementById('category');
let submit = document.getElementById('submit');

let mood = 'create'; // متغير لتحديد الوضع الحالي: هل هو وضع "إنشاء" أم "تعديل"
let tmp; // متغير مؤقت لحفظ رقم المنتج (index) عند التعديل

// 2. دالة حساب السعر الإجمالي (Get Total)
// تقوم بجمع السعر والضرائب والإعلانات وطرح الخصم
function getTotal() {
    if (price.value != '') {
        // تحويل القيم النصية إلى أرقام باستخدام (+) وحساب النتيجة
        let result = (+price.value + +taxes.value + +ads.value) - +discount.value;
        total.innerHTML = result;
        total.style.background = '#27ae60'; // تغيير اللون للأخضر عند وجود نتيجة
    } else {
        total.innerHTML = '';
        total.style.background = '#e74c3c'; // العودة للون الأحمر إذا كان السعر فارغاً
    }
}

// 3. تهيئة مصفوفة البيانات (Array) لحفظ المنتجات
// نفحص الذاكرة المحلية (LocalStorage) إذا كان فيها بيانات قديمة نسترجعها، وإلا ننشئ مصفوفة فارغة
let datapro;
if (localStorage.product != null) {
    datapro = JSON.parse(localStorage.product);
} else {
    datapro = [];
}

// 4. دالة الزر الرئيسي (Create / Update)
// يتم تنفيذها عند الضغط على زر Submit
submit.onclick = function() {
    // تجميع بيانات المنتج الجديد في كائن (Object)
    let newpro = {
        title: title.value.toLowerCase(), // حفظ الاسم بحروف صغيرة لتسهيل البحث
        price: price.value,
        taxes: taxes.value,
        ads: ads.value,
        discount: discount.value,
        total: total.innerHTML,
        count: count.value,
        category: category.value.toLowerCase(),
    }

    // التحقق من صحة البيانات (Validation) قبل الحفظ
    if (title.value != '' && price.value != '' && category.value != '' && newpro.count <= 100) {
        
        if (mood === 'create') {
            // -- وضع الإنشاء --
            // إذا كان العدد (count) أكبر من 1، نكرر عملية الإضافة
            if (newpro.count > 1) {
                for (let i = 0; i < newpro.count; i++) {
                    datapro.push(newpro); // إضافة المنتج للمصفوفة
                }
            } else {
                datapro.push(newpro); // إضافة منتج واحد فقط
            }
        } else {
            // -- وضع التعديل --
            datapro[tmp] = newpro; // استبدال المنتج القديم بالجديد بناءً على الاندكس
            mood = 'create'; // إعادة الوضع للافتراضي
            submit.innerHTML = 'Create'; // إعادة اسم الزر
            count.style.display = 'block'; // إظهار حقل العدد مجدداً
        }
        cleardata(); // مسح البيانات من الحقول بعد الانتهاء
    }

    // 5. حفظ المصفوفة في التخزين المحلي للمتصفح (Local Storage)
    localStorage.setItem('product', JSON.stringify(datapro));
    
    showdata(); // تحديث الجدول لعرض البيانات الجديدة
}

// 6. دالة مسح البيانات (Clear Data)
// تقوم بتفريغ جميع حقول الإدخال لتكون جاهزة لمنتج جديد
function cleardata() {
    title.value = '';
    price.value = '';
    taxes.value = '';
    ads.value = '';
    discount.value = '';
    total.innerHTML = '';
    count.value = '';
    category.value = '';
}

// 7. دالة عرض البيانات (Show Data)
// تقوم بقراءة المصفوفة وعرضها داخل جدول HTML
function showdata() {
    getTotal(); // إعادة ضبط ألوان مربع المجموع
    let table = '';
    
    // حلقة تكرار للمرور على جميع المنتجات وبناء صفوف الجدول
    // ملاحظة: تم تعديل i=1 إلى i=0 لضمان عرض العنصر الأول
    for (let i = 0; i < datapro.length; i++) {
        table += `<tr>
                    <td>${i+1}</td>
                    <td>${datapro[i].title}</td>
                    <td>${datapro[i].price}</td>
                    <td>${datapro[i].taxes}</td>
                    <td>${datapro[i].ads}</td>
                    <td>${datapro[i].discount}</td>
                    <td>${datapro[i].total}</td>
                    <td>${datapro[i].category}</td>
                    <td><button onclick="updatedata(${i})" id="update">Update</button></td>
                    <td><button onclick="deletedata(${i})" id="delete">Delete</button></td>
                </tr>`;
    }
    
    document.getElementById('tbody').innerHTML = table;
    
    // إظهار زر "حذف الكل" فقط إذا كانت هناك بيانات
    let btndelete = document.getElementById('deleteall');
    if (datapro.length > 0) {
        btndelete.innerHTML = `
        <button onclick="deleteall()">Delete All (${datapro.length})</button>
        `
    } else {
        btndelete.innerHTML = '';
    }
}
showdata(); // تشغيل الدالة دائماً عند فتح الصفحة

// 8. دالة حذف منتج واحد (Delete Data)
function deletedata(i) {
    datapro.splice(i, 1); // حذف عنصر واحد بناءً على الاندكس
    localStorage.product = JSON.stringify(datapro); // تحديث التخزين المحلي
    showdata(); // تحديث الجدول
}

// 9. دالة حذف جميع المنتجات (Delete All)
function deleteall() {
    localStorage.clear(); // مسح التخزين المحلي
    datapro.splice(0); // تفريغ المصفوفة بالكامل
    showdata(); // تحديث الجدول
}

// 10. دالة التعديل (Update Data)
// تقوم بأخذ بيانات المنتج ووضعها في الحقول للتعديل عليها
function updatedata(i) {
    title.value = datapro[i].title;
    price.value = datapro[i].price;
    taxes.value = datapro[i].taxes;
    ads.value = datapro[i].ads;
    discount.value = datapro[i].discount;
    getTotal(); // حساب المجموع تلقائياً
    count.style.display = 'none'; // إخفاء حقل العدد لأنه لا نحتاجه في التعديل
    category.value = datapro[i].category;
    submit.innerHTML = 'Update'; // تغيير اسم الزر
    mood = 'update'; // تغيير الوضع إلى تعديل
    tmp = i; // حفظ رقم المنتج لنستخدمه عند الضغط على الزر
    scroll({ top: 0, behavior: 'smooth' }); // الصعود لأعلى الصفحة
}

// 11. دوال البحث (Search)
let searchmood = 'title'; // الافتراضي البحث بالعنوان

function getsearchmood(id) {
    let search = document.getElementById('search');
    if (id == 'searchtitle') {
        searchmood = 'title';
    } else {
        searchmood = 'category';
    }
    search.placeholder = 'Search By ' + searchmood;
    search.focus();
    search.value = '';
    showdata();
}

// دالة تنفيذ البحث وتصفية البيانات
function searchdata(value) {
    let table = '';
    for (let i = 0; i < datapro.length; i++) {
        // التحقق هل البحث بالعنوان أم بالتصنيف
        if (searchmood == 'title') {
            if (datapro[i].title.includes(value.toLowerCase())) {
                // نفس كود بناء الصف في الجدول
                table += `<tr>
                    <td>${i+1}</td>
                    <td>${datapro[i].title}</td>
                    <td>${datapro[i].price}</td>
                    <td>${datapro[i].taxes}</td>
                    <td>${datapro[i].ads}</td>
                    <td>${datapro[i].discount}</td>
                    <td>${datapro[i].total}</td>
                    <td>${datapro[i].category}</td>
                    <td><button onclick="updatedata(${i})" id="update">Update</button></td>
                    <td><button onclick="deletedata(${i})" id="delete">Delete</button></td>
                </tr>`;
            }
        } else {
            if (datapro[i].category.includes(value.toLowerCase())) {
                table += `<tr>
                    <td>${i+1}</td>
                    <td>${datapro[i].title}</td>
                    <td>${datapro[i].price}</td>
                    <td>${datapro[i].taxes}</td>
                    <td>${datapro[i].ads}</td>
                    <td>${datapro[i].discount}</td>
                    <td>${datapro[i].total}</td>
                    <td>${datapro[i].category}</td>
                    <td><button onclick="updatedata(${i})" id="update">Update</button></td>
                    <td><button onclick="deletedata(${i})" id="delete">Delete</button></td>
                </tr>`;
            }
        }
    }
    document.getElementById('tbody').innerHTML = table;
}