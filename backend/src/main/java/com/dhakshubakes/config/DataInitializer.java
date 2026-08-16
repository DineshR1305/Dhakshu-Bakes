package com.dhakshubakes.config;

import com.dhakshubakes.entity.*;
import com.dhakshubakes.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final FAQRepository faqRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initUsers();
        initCategoriesAndProducts();
        initStores();
        initFAQs();
        initCoupons();
    }

    private void initUsers() {
        if (!userRepository.existsByEmail("admin@dhakshubakes.local")) {
            User admin = User.builder()
                    .fullName("Dhakshu Admin")
                    .email("admin@dhakshubakes.local")
                    .password(passwordEncoder.encode("Admin@12345"))
                    .phone("+91 9876543210")
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin User created: admin@dhakshubakes.local");
        }

        if (!userRepository.existsByEmail("customer@dhakshubakes.local")) {
            User customer = User.builder()
                    .fullName("Anita Sharma")
                    .email("customer@dhakshubakes.local")
                    .password(passwordEncoder.encode("Customer@12345"))
                    .phone("+91 9876543211")
                    .role(Role.ROLE_CUSTOMER)
                    .enabled(true)
                    .build();
            userRepository.save(customer);
            log.info("Default Customer User created: customer@dhakshubakes.local");
        }
    }

    private void initCategoriesAndProducts() {
        if (categoryRepository.count() > 0) return;

        Category cakes = Category.builder().name("Cakes").slug("cakes").description("Handcrafted celebration cakes baked fresh daily").imageUrl("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600").displayOrder(1).build();
        Category cupcakes = Category.builder().name("Cupcakes").slug("cupcakes").description("Delicate gourmet cupcakes topped with rich buttercream").imageUrl("https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600").displayOrder(2).build();
        Category brownies = Category.builder().name("Brownies").slug("brownies").description("Fudgy, dense Belgian chocolate brownies").imageUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600").displayOrder(3).build();
        Category cookies = Category.builder().name("Cookies").slug("cookies").description("Crispy edges, chewy centers baked with real butter").imageUrl("https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600").displayOrder(4).build();
        Category pastries = Category.builder().name("Pastries").slug("pastries").description("Flaky French croissants & Danish pastries").imageUrl("https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600").displayOrder(5).build();
        Category gifts = Category.builder().name("Gift Boxes").slug("gift-boxes").description("Curated hamper boxes for celebrations & gifting").imageUrl("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600").displayOrder(6).build();

        categoryRepository.saveAll(List.of(cakes, cupcakes, brownies, cookies, pastries, gifts));

        // Sample Product 1: Chocolate Truffle Cake
        Product p1 = Product.builder()
                .category(cakes)
                .name("Signature Belgian Chocolate Truffle Cake")
                .slug("chocolate-truffle-cake")
                .description("Rich dark chocolate sponge layered with silky Belgian ganache and handcrafted chocolate curls.")
                .ingredients("Dark Chocolate 70%, Fresh Cream, Wheat Flour, Butter, Cocoa Powder, Sugar, Vanilla Extract")
                .allergens("Contains Dairy, Wheat, Gluten. Nuts free environment.")
                .nutritionFacts("Calories: 380 kcal per 100g, Protein: 5g, Carbohydrates: 45g, Fat: 20g")
                .storageInstructions("Refrigerate between 2°C – 5°C. Consume within 3 days.")
                .deliveryInfo("Available for same-day delivery across Metro areas.")
                .isEggless(true)
                .isFeatured(true)
                .isBestseller(true)
                .ratingAvg(4.9)
                .reviewCount(42)
                .build();

        ProductVariant v1a = ProductVariant.builder().product(p1).sku("CAKE-TRUFFLE-500G").variantName("500g (Serves 4-6)").price(new BigDecimal("699.00")).discountPrice(new BigDecimal("599.00")).weightGrams(500).build();
        Inventory i1a = Inventory.builder().variant(v1a).stockQuantity(25).lowStockThreshold(5).build();
        v1a.setInventory(i1a);

        ProductVariant v1b = ProductVariant.builder().product(p1).sku("CAKE-TRUFFLE-1KG").variantName("1kg (Serves 8-12)").price(new BigDecimal("1299.00")).discountPrice(new BigDecimal("1099.00")).weightGrams(1000).build();
        Inventory i1b = Inventory.builder().variant(v1b).stockQuantity(15).lowStockThreshold(3).build();
        v1b.setInventory(i1b);

        ProductImage img1 = ProductImage.builder().product(p1).imageUrl("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800").altText("Chocolate Truffle Cake").isPrimary(true).build();
        p1.setVariants(List.of(v1a, v1b));
        p1.setImages(List.of(img1));

        // Sample Product 2: Velvet Rose Cupcake Set
        Product p2 = Product.builder()
                .category(cupcakes)
                .name("Red Velvet Buttercream Cupcakes")
                .slug("red-velvet-cupcakes")
                .description("Soft red velvet sponge infused with mild cocoa and topped with smooth cream cheese frosting.")
                .ingredients("Refined Flour, Cocoa, Milk, Cream Cheese, Butter, Organic Red Extract")
                .allergens("Contains Milk, Gluten")
                .isEggless(false)
                .isFeatured(true)
                .isBestseller(true)
                .ratingAvg(4.8)
                .reviewCount(28)
                .build();

        ProductVariant v2a = ProductVariant.builder().product(p2).sku("CUP-REDVELVET-BOX4").variantName("Box of 4").price(new BigDecimal("349.00")).discountPrice(new BigDecimal("299.00")).weightGrams(300).build();
        Inventory i2a = Inventory.builder().variant(v2a).stockQuantity(30).build();
        v2a.setInventory(i2a);

        ProductImage img2 = ProductImage.builder().product(p2).imageUrl("https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800").altText("Red Velvet Cupcakes").isPrimary(true).build();
        p2.setVariants(List.of(v2a));
        p2.setImages(List.of(img2));

        // Sample Product 3: Belgian Walnut Brownies
        Product p3 = Product.builder()
                .category(brownies)
                .name("Belgian Dark Chocolate Walnut Brownie")
                .slug("belgian-walnut-brownie")
                .description("Fudgy, dense cocoa brownies loaded with toasted California walnuts.")
                .ingredients("Dark Chocolate, Butter, California Walnuts, Cocoa, Sugar")
                .allergens("Contains Nuts, Milk, Gluten")
                .isEggless(true)
                .isBestseller(true)
                .ratingAvg(4.9)
                .reviewCount(55)
                .build();

        ProductVariant v3a = ProductVariant.builder().product(p3).sku("BRW-WALNUT-BOX6").variantName("Box of 6 Slices").price(new BigDecimal("499.00")).discountPrice(new BigDecimal("449.00")).weightGrams(400).build();
        Inventory i3a = Inventory.builder().variant(v3a).stockQuantity(40).build();
        v3a.setInventory(i3a);

        ProductImage img3 = ProductImage.builder().product(p3).imageUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800").altText("Walnut Brownie Box").isPrimary(true).build();
        p3.setVariants(List.of(v3a));
        p3.setImages(List.of(img3));

        // Sample Product 4: Choco Chunk Butter Cookies
        Product p4 = Product.builder()
                .category(cookies)
                .name("Classic Choco Chunk Butter Cookies")
                .slug("choco-chunk-cookies")
                .description("Golden butter cookies stuffed with generous chunks of dark chocolate.")
                .ingredients("Butter, Dark Chocolate Chunks, Flour, Brown Sugar")
                .isEggless(true)
                .isFeatured(true)
                .ratingAvg(4.7)
                .reviewCount(19)
                .build();

        ProductVariant v4a = ProductVariant.builder().product(p4).sku("CK-CHOCOCHUNK-250G").variantName("250g Jar").price(new BigDecimal("299.00")).weightGrams(250).build();
        Inventory i4a = Inventory.builder().variant(v4a).stockQuantity(50).build();
        v4a.setInventory(i4a);

        ProductImage img4 = ProductImage.builder().product(p4).imageUrl("https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800").altText("Choco Chunk Cookies").isPrimary(true).build();
        p4.setVariants(List.of(v4a));
        p4.setImages(List.of(img4));

        productRepository.saveAll(List.of(p1, p2, p3, p4));
        log.info("Initialized 4 sample bakery products with variants and inventory.");
    }

    private void initStores() {
        if (storeRepository.count() > 0) return;

        Store s1 = Store.builder()
                .name("Dhakshu Bakes — Flagship Boutique")
                .address("104 Park Avenue, Indiranagar, Bengaluru, Karnataka 560038")
                .phone("+91 80 2525 8899")
                .openingHours("Mon-Sun: 8:00 AM – 10:30 PM")
                .latitude(12.9784)
                .longitude(77.6408)
                .services("Custom Cake Design, Pickup, Cafe Dine-in")
                .hasPickup(true)
                .build();

        Store s2 = Store.builder()
                .name("Dhakshu Bakes — Jubilee Hills Studio")
                .address("Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033")
                .phone("+91 40 6677 9900")
                .openingHours("Mon-Sun: 9:00 AM – 11:00 PM")
                .latitude(17.4319)
                .longitude(78.4073)
                .services("Pickup, Express Counter, Gift Hampers")
                .hasPickup(true)
                .build();

        storeRepository.saveAll(List.of(s1, s2));
    }

    private void initFAQs() {
        if (faqRepository.count() > 0) return;

        FAQ f1 = FAQ.builder().category("Orders").question("How far in advance should I order custom cakes?").answer("We recommend placing custom cake orders at least 24 to 48 hours in advance so our head chefs can craft your design with precision.").displayOrder(1).build();
        FAQ f2 = FAQ.builder().category("Delivery").question("Do you offer eggless options?").answer("Yes! Over 80% of our product range is available in 100% pure eggless variants without compromising on texture or flavor.").displayOrder(2).build();
        FAQ f3 = FAQ.builder().category("Payments").question("What payment methods are supported?").answer("We accept UPI (GPay, PhonePe, Paytm), Cards (Credit & Debit), NetBanking, and Razorpay Wallets.").displayOrder(3).build();

        faqRepository.saveAll(List.of(f1, f2, f3));
    }

    private void initCoupons() {
        if (couponRepository.count() > 0) return;

        Coupon c1 = Coupon.builder()
                .code("WELCOME10")
                .discountType("PERCENTAGE")
                .discountValue(new BigDecimal("10.00"))
                .minOrderAmount(new BigDecimal("300.00"))
                .maxDiscountAmount(new BigDecimal("150.00"))
                .usageLimit(1000)
                .isActive(true)
                .build();

        Coupon c2 = Coupon.builder()
                .code("DHAKSHU100")
                .discountType("FIXED")
                .discountValue(new BigDecimal("100.00"))
                .minOrderAmount(new BigDecimal("800.00"))
                .usageLimit(500)
                .isActive(true)
                .build();

        couponRepository.saveAll(List.of(c1, c2));
    }
}
