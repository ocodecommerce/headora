<?php
namespace Ocode\Headora\Observer;
use Magento\Framework\Event\ObserverInterface;

/**
 * On product save, purge matching Next.js cache tags via POST NEXT_URL/api/revalidate.
 * Config via env: NEXT_URL (storefront origin), HEADORA_REVALIDATE_SECRET.
 * Best-effort: never blocks the admin save on failure.
 */
class Revalidate implements ObserverInterface {
  public function execute(\Magento\Framework\Event\Observer $o) {
    try {
      $nextUrl = getenv('NEXT_URL') ?: '';
      $secret = getenv('HEADORA_REVALIDATE_SECRET') ?: '';
      if (!$nextUrl || !$secret) return $this;

      $product = $o->getEvent()->getProduct();
      $tags = ['cms'];
      if ($product) {
        $sku = method_exists($product, 'getSku') ? $product->getSku() : null;
        $id = method_exists($product, 'getId') ? $product->getId() : null;
        if ($sku) { $tags[] = 'pdp:' . $sku; $tags[] = 'reviews:' . $sku; }
        if ($id) { $tags[] = 'cat:' . $id; }
        $catIds = method_exists($product, 'getCategoryIds') ? (array)$product->getCategoryIds() : [];
        foreach ($catIds as $cid) { $tags[] = 'cat:' . $cid; }
      }

      $payload = json_encode(['secret' => $secret, 'tags' => array_values(array_unique($tags))]);
      $ch = curl_init(rtrim($nextUrl, '/') . '/api/revalidate');
      curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 3,
        CURLOPT_CONNECTTIMEOUT => 2,
      ]);
      curl_exec($ch);
      curl_close($ch);
    } catch (\Throwable $e) {
      // best-effort only
    }
    return $this;
  }
}
