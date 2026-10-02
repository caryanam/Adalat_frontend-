import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

public class Replacer {
    public static void main(String[] args) throws Exception {
        String filePath = "C:\\Users\\Asus Vivobook\\Desktop\\Adalat\\Adalat_Backend\\src\\main\\java\\com\\adalat\\serviceImpl\\CustomerServiceImpl.java";
        String content = new String(Files.readAllBytes(Paths.get(filePath)), StandardCharsets.UTF_8);

        String target = "        if (transaction == null && customerId != null) {\n" +
                        "            Customer customer = customerRepository.findById(customerId).orElse(null);\n" +
                        "            if (customer != null) {\n" +
                        "                transaction = PaymentTransaction.builder()\n" +
                        "                        .customer(customer)\n" +
                        "                        .orderId(request.getOrderId() != null && !request.getOrderId().isBlank() ? request.getOrderId() : (\"ORD-\" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()))\n" +
                        "                        .amount(new java.math.BigDecimal(\"116.82\"))\n" +
                        "                        .paymentType(\"REGISTRATION\")\n" +
                        "                        .status(PaymentStatus.PAID)\n" +
                        "                        .gatewayPaymentId(request.getGatewayPaymentId())\n" +
                        "                        .build();\n" +
                        "                paymentTransactionRepository.save(transaction);";
        
        target = target.replace("\r\n", "\n");

        String replacement = "        if (transaction == null && customerId != null) {\n" +
                             "            Customer customer = customerRepository.findById(customerId).orElse(null);\n" +
                             "            if (customer != null) {\n" +
                             "                transaction = paymentTransactionRepository.findByCustomerAndStatus(customer, PaymentStatus.PENDING).orElse(null);\n" +
                             "                \n" +
                             "                if (transaction != null) {\n" +
                             "                    if (request.getGatewayPaymentId() != null) {\n" +
                             "                        transaction.setGatewayPaymentId(request.getGatewayPaymentId());\n" +
                             "                    }\n" +
                             "                    transaction.setStatus(PaymentStatus.PAID);\n" +
                             "                    paymentTransactionRepository.save(transaction);\n" +
                             "                } else {\n" +
                             "                    transaction = PaymentTransaction.builder()\n" +
                             "                            .customer(customer)\n" +
                             "                            .orderId(request.getOrderId() != null && !request.getOrderId().isBlank() ? request.getOrderId() : (\"ORD-\" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()))\n" +
                             "                            .amount(new java.math.BigDecimal(\"116.82\"))\n" +
                             "                            .paymentType(\"REGISTRATION\")\n" +
                             "                            .status(PaymentStatus.PAID)\n" +
                             "                            .gatewayPaymentId(request.getGatewayPaymentId())\n" +
                             "                            .build();\n" +
                             "                    paymentTransactionRepository.save(transaction);\n" +
                             "                }";

        // Because we don't know the exact line endings of the source file, let's normalize everything to \n for matching
        String normalizedContent = content.replace("\r\n", "\n");
        
        if (normalizedContent.contains(target)) {
            normalizedContent = normalizedContent.replace(target, replacement);
            Files.write(Paths.get(filePath), normalizedContent.getBytes(StandardCharsets.UTF_8));
            System.out.println("Success!");
        } else {
            System.out.println("Target not found!");
            // Let's print the relevant part to see why it didn't match
            int idx = normalizedContent.indexOf("if (transaction == null && customerId != null) {");
            if (idx != -1) {
                System.out.println(normalizedContent.substring(idx, Math.min(idx + 500, normalizedContent.length())));
            }
        }
    }
}
