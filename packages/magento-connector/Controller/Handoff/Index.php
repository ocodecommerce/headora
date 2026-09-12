<?php
namespace Ocode\Headora\Controller\Handoff;
class Index extends \Magento\Framework\App\Action\Action {
  public function execute() {
    $masked = $this->getRequest()->getParam('masked_quote');
    return $this->_redirect('checkout'); // resolve masked quote -> session quote here
  }
}
