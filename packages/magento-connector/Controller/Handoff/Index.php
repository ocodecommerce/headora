<?php
declare(strict_types=1);

namespace Ocode\Headora\Controller\Handoff;

use Magento\Checkout\Model\Session as CheckoutSession;
use Magento\Customer\Model\Session as CustomerSession;
use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Controller\Result\Redirect;
use Magento\Framework\Controller\Result\RedirectFactory;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Model\MaskedQuoteIdToQuoteIdInterface;

/**
 * GET /headora/handoff?masked_quote=<id>
 *
 * Binds the headless cart to the Magento session and sends the shopper to native /checkout.
 * Guest carts: the masked id is the bearer secret. Customer carts: only the owning,
 * logged-in customer may take them over; everyone else lands on the cart page.
 */
class Index implements HttpGetActionInterface
{
    /**
     * @param RequestInterface $request
     * @param RedirectFactory $redirectFactory
     * @param MaskedQuoteIdToQuoteIdInterface $maskedQuoteIdToQuoteId
     * @param CartRepositoryInterface $cartRepository
     * @param CheckoutSession $checkoutSession
     * @param CustomerSession $customerSession
     */
    public function __construct(
        private readonly RequestInterface $request,
        private readonly RedirectFactory $redirectFactory,
        private readonly MaskedQuoteIdToQuoteIdInterface $maskedQuoteIdToQuoteId,
        private readonly CartRepositoryInterface $cartRepository,
        private readonly CheckoutSession $checkoutSession,
        private readonly CustomerSession $customerSession
    ) {
    }

    /**
     * @inheritdoc
     */
    public function execute(): Redirect
    {
        $redirect = $this->redirectFactory->create();
        $masked = (string)$this->request->getParam('masked_quote');
        if ($masked === '') {
            return $redirect->setPath('checkout/cart');
        }

        try {
            $quote = $this->cartRepository->get($this->maskedQuoteIdToQuoteId->execute($masked));
        } catch (NoSuchEntityException $e) {
            return $redirect->setPath('checkout/cart');
        }

        $ownerId = (int)$quote->getCustomerId();
        if (!$quote->getIsActive()
            || ($ownerId && $ownerId !== (int)$this->customerSession->getCustomerId())
        ) {
            return $redirect->setPath('checkout/cart');
        }

        $this->checkoutSession->replaceQuote($quote);
        return $redirect->setPath('checkout');
    }
}
