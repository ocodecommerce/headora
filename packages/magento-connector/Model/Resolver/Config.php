<?php
declare(strict_types=1);

namespace Ocode\Headora\Model\Resolver;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Store\Model\ScopeInterface;

/**
 * Resolves headoraConfig for the store selected by the GraphQL Store header.
 */
class Config implements ResolverInterface
{
    private const XML_PRESET = 'headora/general/preset';
    private const XML_BLOCKS = 'headora/general/blocks';

    /**
     * @param ScopeConfigInterface $scopeConfig
     */
    public function __construct(
        private readonly ScopeConfigInterface $scopeConfig
    ) {
    }

    /**
     * @inheritdoc
     */
    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null)
    {
        $storeId = (int)$context->getExtensionAttributes()->getStore()->getId();

        return [
            'preset' => (string)$this->scopeConfig->getValue(self::XML_PRESET, ScopeInterface::SCOPE_STORE, $storeId),
            'blocks' => (string)$this->scopeConfig->getValue(self::XML_BLOCKS, ScopeInterface::SCOPE_STORE, $storeId),
        ];
    }
}
