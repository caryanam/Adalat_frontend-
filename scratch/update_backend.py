import sys
import os

file_path = r"C:\Users\Asus Vivobook\Desktop\Adalat\Adalat_Backend\src\main\java\com\adalat\serviceImpl\CustomerServiceImpl.java"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """        if (transaction == null && customerId != null) {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer != null) {
                transaction = PaymentTransaction.builder()
                        .customer(customer)
                        .orderId(request.getOrderId() != null && !request.getOrderId().isBlank() ? request.getOrderId() : ("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()))
                        .amount(new java.math.BigDecimal("116.82"))
                        .paymentType("REGISTRATION")
                        .status(PaymentStatus.PAID)
                        .gatewayPaymentId(request.getGatewayPaymentId())
                        .build();
                paymentTransactionRepository.save(transaction);"""

replacement = """        if (transaction == null && customerId != null) {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer != null) {
                transaction = paymentTransactionRepository.findByCustomerAndStatus(customer, PaymentStatus.PENDING).orElse(null);
                
                if (transaction != null) {
                    if (request.getGatewayPaymentId() != null) {
                        transaction.setGatewayPaymentId(request.getGatewayPaymentId());
                    }
                    transaction.setStatus(PaymentStatus.PAID);
                    paymentTransactionRepository.save(transaction);
                } else {
                    transaction = PaymentTransaction.builder()
                            .customer(customer)
                            .orderId(request.getOrderId() != null && !request.getOrderId().isBlank() ? request.getOrderId() : ("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()))
                            .amount(new java.math.BigDecimal("116.82"))
                            .paymentType("REGISTRATION")
                            .status(PaymentStatus.PAID)
                            .gatewayPaymentId(request.getGatewayPaymentId())
                            .build();
                    paymentTransactionRepository.save(transaction);
                }"""

if target in content:
    new_content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Success: Replaced block in CustomerServiceImpl.java")
else:
    print("Error: Target block not found")
