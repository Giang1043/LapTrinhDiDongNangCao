

export const mockUsers = [
  {
    id: '1',
    email: 'hieu@test.com',
    password: '123456',
    fullName: 'Hoang Ba Hieu',
    phone: '0901234567',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

export const mockCategories = [
  { id: '1', name: 'Cơm', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200' },
  { id: '2', name: 'Phở & Bún', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200' },
  { id: '3', name: 'Pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200' },
  { id: '4', name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200' },
  { id: '5', name: 'Trà sữa', image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=200' },
  { id: '6', name: 'Gà rán', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200' },
  { id: '7', name: 'Bánh mì', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200' },
  { id: '8', name: 'Lẩu', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200' },
  { id: '9', name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200' },
  { id: '10', name: 'Đồ uống', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200' },
];

export const mockProducts = [
  // Category 1: Cơm
  { id: '1', name: 'Cơm tấm sườn bì chả', price: 45000, originalPrice: 55000, discount: 18, image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400', categoryId: '1', sold: 320, rating: 4.8, description: 'Cơm tấm sườn bì chả truyền thống Sài Gòn, thịt sườn nướng than hồng thơm lừng, bì giòn, chả trứng mềm mịn. Kèm nước mắm pha đặc biệt.', shop: 'Quán Cơm Tấm Sài Gòn' },
  { id: '2', name: 'Cơm gà Hải Nam', price: 50000, originalPrice: 60000, discount: 17, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', categoryId: '1', sold: 280, rating: 4.7, description: 'Cơm gà Hải Nam với gà luộc mềm, cơm nấu nước dùng gà thơm ngậy. Kèm nước chấm gừng đặc biệt.', shop: 'Hải Nam Kitchen' },
  { id: '3', name: 'Cơm chiên dương châu', price: 40000, originalPrice: 45000, discount: 11, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', categoryId: '1', sold: 195, rating: 4.5, description: 'Cơm chiên dương châu với tôm, lạp xưởng, trứng, đậu hà lan. Hạt cơm tơi rời, thơm ngon.', shop: 'Quán 68' },

  // Category 2: Phở & Bún
  { id: '4', name: 'Phở bò tái nạm', price: 55000, originalPrice: 70000, discount: 21, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', categoryId: '2', sold: 450, rating: 4.9, description: 'Phở bò truyền thống Hà Nội, nước dùng ninh xương 12 tiếng, thịt bò tái mềm, nạm giòn. Kèm rau thơm tươi.', shop: 'Phở Thìn Hà Nội' },
  { id: '5', name: 'Bún bò Huế', price: 50000, originalPrice: 60000, discount: 17, image: 'https://images.unsplash.com/photo-1576577445504-6af96477db52?w=400', categoryId: '2', sold: 380, rating: 4.8, description: 'Bún bò Huế cay nồng đậm đà, thịt bò, giò heo, chả cua. Nước dùng đỏ au hấp dẫn.', shop: 'Bún Bò Huế O Xuân' },
  { id: '6', name: 'Bún chả Hà Nội', price: 45000, originalPrice: 50000, discount: 10, image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', categoryId: '2', sold: 290, rating: 4.6, description: 'Bún chả nướng than hoa thơm lừng, nước mắm chua ngọt. Kèm nem rán giòn.', shop: 'Bún Chả 34' },

  // Category 3: Pizza
  { id: '7', name: 'Pizza Margherita', price: 89000, originalPrice: 120000, discount: 26, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', categoryId: '3', sold: 210, rating: 4.7, description: 'Pizza Margherita với sốt cà chua tươi, phô mai Mozzarella, lá basil. Đế bánh giòn mỏng kiểu Ý.', shop: 'Pizza House' },
  { id: '8', name: 'Pizza Pepperoni', price: 99000, originalPrice: 130000, discount: 24, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', categoryId: '3', sold: 340, rating: 4.8, description: 'Pizza với lát pepperoni cay nhẹ, phô mai kéo sợi, sốt cà chua đặc biệt.', shop: 'Pizza House' },

  // Category 4: Burger
  { id: '9', name: 'Classic Beef Burger', price: 65000, originalPrice: 80000, discount: 19, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', categoryId: '4', sold: 260, rating: 4.6, description: 'Burger bò Úc 100%, rau sống, cà chua, phô mai cheddar. Bánh mì mềm nướng vàng.', shop: 'Burger Bros' },
  { id: '10', name: 'Chicken Burger', price: 55000, originalPrice: 65000, discount: 15, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', categoryId: '4', sold: 220, rating: 4.5, description: 'Burger gà chiên giòn, sốt mayo, rau sống tươi. Phần ăn kèm khoai tây chiên.', shop: 'Burger Bros' },

  // Category 5: Trà sữa
  { id: '11', name: 'Trà sữa trân châu đường đen', price: 35000, originalPrice: 45000, discount: 22, image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', categoryId: '5', sold: 520, rating: 4.9, description: 'Trà sữa đường đen béo ngậy với trân châu đường đen dai mềm. Vị ngọt đậm đà.', shop: 'Tiger Sugar' },
  { id: '12', name: 'Trà sữa matcha', price: 40000, originalPrice: 50000, discount: 20, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', categoryId: '5', sold: 310, rating: 4.7, description: 'Trà sữa matcha Nhật Bản, vị trà xanh đậm, sữa tươi béo ngon. Topping trân châu trắng.', shop: 'Gong Cha' },

  // Category 6: Gà rán
  { id: '13', name: 'Gà rán sốt cay', price: 75000, originalPrice: 95000, discount: 21, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', categoryId: '6', sold: 410, rating: 4.8, description: 'Gà rán giòn phủ sốt cay Hàn Quốc. 3 miếng gà đùi, kèm coleslaw và khoai tây.', shop: 'Korean Chicken' },
  { id: '14', name: 'Gà rán truyền thống', price: 65000, originalPrice: 75000, discount: 13, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', categoryId: '6', sold: 350, rating: 4.6, description: 'Gà rán giòn rụm kiểu Mỹ, gia vị bí truyền. 3 miếng gà kèm nước sốt.', shop: 'KFC Express' },

  // Category 7: Bánh mì
  { id: '15', name: 'Bánh mì thịt nướng', price: 25000, originalPrice: 35000, discount: 29, image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400', categoryId: '7', sold: 480, rating: 4.8, description: 'Bánh mì Sài Gòn với thịt nướng than hồng, đồ chua, rau sống, pate. Vỏ giòn ruột mềm.', shop: 'Bánh Mì Huỳnh Hoa' },
  { id: '16', name: 'Bánh mì ốp la', price: 20000, originalPrice: 25000, discount: 20, image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400', categoryId: '7', sold: 230, rating: 4.4, description: 'Bánh mì trứng ốp la, pate, bơ. Đơn giản nhưng thơm ngon đậm đà.', shop: 'Bánh Mì Cô Ba' },

  // Category 8: Lẩu
  { id: '17', name: 'Lẩu Thái Tom Yum', price: 199000, originalPrice: 250000, discount: 20, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', categoryId: '8', sold: 180, rating: 4.7, description: 'Lẩu Thái chua cay nồng nàn, hải sản tươi sống, nấm, rau. Phần cho 2-3 người.', shop: 'Thai Express' },
  { id: '18', name: 'Lẩu gà lá é', price: 189000, originalPrice: 230000, discount: 18, image: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=400', categoryId: '8', sold: 150, rating: 4.6, description: 'Lẩu gà ta thả lá é thơm nức mũi. Gà dai ngọt, nước lẩu thanh mát. Phần 2-3 người.', shop: 'Lẩu Gà 99' },

  // Category 9: Sushi
  { id: '19', name: 'Sushi Combo 12 miếng', price: 159000, originalPrice: 200000, discount: 21, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400', categoryId: '9', sold: 160, rating: 4.8, description: 'Combo 12 miếng sushi: cá hồi, tôm, lươn, trứng. Kèm gừng, wasabi, nước tương.', shop: 'Sushi Tokyo' },
  { id: '20', name: 'Sashimi cá hồi', price: 129000, originalPrice: 160000, discount: 19, image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400', categoryId: '9', sold: 140, rating: 4.7, description: 'Sashimi cá hồi Na Uy tươi, thái lát mỏng. 12 lát kèm wasabi và nước tương.', shop: 'Sushi Tokyo' },

  // Category 10: Đồ uống
  { id: '21', name: 'Sinh tố bơ', price: 30000, originalPrice: 40000, discount: 25, image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400', categoryId: '10', sold: 270, rating: 4.6, description: 'Sinh tố bơ béo ngậy, thêm sữa đặc. Mát lạnh, bổ dưỡng.', shop: 'Juice Corner' },
  { id: '22', name: 'Nước ép cam', price: 25000, originalPrice: 30000, discount: 17, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', categoryId: '10', sold: 240, rating: 4.5, description: 'Nước ép cam tươi 100%, không đường. Giàu vitamin C, tốt cho sức khỏe.', shop: 'Juice Corner' },

  // Extra products for pagination testing
  { id: '23', name: 'Cơm sườn nướng', price: 42000, originalPrice: 50000, discount: 16, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', categoryId: '1', sold: 180, rating: 4.5, description: 'Cơm sườn nướng mật ong, kèm canh và dưa leo.', shop: 'Quán Cơm Việt' },
  { id: '24', name: 'Phở gà', price: 48000, originalPrice: 55000, discount: 13, image: 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=400', categoryId: '2', sold: 200, rating: 4.5, description: 'Phở gà truyền thống, nước dùng thanh ngọt.', shop: 'Phở 24' },
  { id: '25', name: 'Pizza Hải sản', price: 109000, originalPrice: 140000, discount: 22, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', categoryId: '3', sold: 190, rating: 4.6, description: 'Pizza hải sản với tôm, mực, nghêu, phô mai.', shop: 'Pizza House' },
  { id: '26', name: 'Double Cheese Burger', price: 79000, originalPrice: 100000, discount: 21, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', categoryId: '4', sold: 175, rating: 4.7, description: 'Burger bò kép phô mai, sốt BBQ đặc biệt.', shop: 'Burger Bros' },
  { id: '27', name: 'Trà đào cam sả', price: 32000, originalPrice: 42000, discount: 24, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', categoryId: '5', sold: 400, rating: 4.8, description: 'Trà đào cam sả thanh mát, đào ngâm mềm ngọt.', shop: 'The Coffee House' },
  { id: '28', name: 'Gà sốt phô mai', price: 85000, originalPrice: 110000, discount: 23, image: 'https://images.unsplash.com/photo-1614398751058-eb2e0bf63e53?w=400', categoryId: '6', sold: 300, rating: 4.7, description: 'Gà rán phủ sốt phô mai béo ngậy.', shop: 'Korean Chicken' },
  { id: '29', name: 'Bánh mì chả cá', price: 22000, originalPrice: 28000, discount: 21, image: 'https://images.unsplash.com/photo-1619221882220-947b3d3c8861?w=400', categoryId: '7', sold: 190, rating: 4.3, description: 'Bánh mì chả cá Nha Trang thơm ngon.', shop: 'Bánh Mì Cô Ba' },
  { id: '30', name: 'Lẩu bò Mỹ', price: 249000, originalPrice: 320000, discount: 22, image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400', categoryId: '8', sold: 120, rating: 4.8, description: 'Lẩu bò Mỹ thượng hạng, rau nấm đầy đủ. Phần 3-4 người.', shop: 'Hotpot Story' },
];

export const mockOrders = [];

let otpStore = {};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (key, otp) => {
  otpStore[key] = { otp, expiry: Date.now() + 5 * 60 * 1000 }; // 5 min
};

export const verifyOTP = (key, otp) => {
  const stored = otpStore[key];
  if (!stored) return false;
  if (Date.now() > stored.expiry) {
    delete otpStore[key];
    return false;
  }
  if (stored.otp === otp) {
    delete otpStore[key];
    return true;
  }
  return false;
};
