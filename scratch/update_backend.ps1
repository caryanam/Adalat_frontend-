$filePath = "C:\Users\Asus Vivobook\Desktop\Adalat\Adalat_Backend\src\main\java\com\adalat\serviceImpl\CustomerServiceImpl.java"
$content = Get-Content $filePath -Raw -Encoding UTF8

$target = @"
        if (transaction == null && customerId != null) {
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
                paymentTransactionRepository.save(transaction);
"@

$replacement = @"
        if (transaction == null && customerId != null) {
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
                }
"@

if ($content.Contains($target)) {
    $content = $content.Replace($target, $replacement)
    Set-Content -Path $filePath -Value $content -Encoding UTF8
    Write-Output "Success: Replaced block in CustomerServiceImpl.java"
} else {
    Write-Output "Error: Target block not found"
}
