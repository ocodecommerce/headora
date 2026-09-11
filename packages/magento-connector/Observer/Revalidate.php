<?php
namespace Ocode\Headora\Observer;
use Magento\Framework\Event\ObserverInterface;
class Revalidate implements ObserverInterface {
  public function execute(\Magento\Framework\Event\Observer $o) {
    return $this; // POST NEXT_URL/api/revalidate {secret, tags:[product_X]} via queue/cron in prod
  }
}
