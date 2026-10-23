<?php
declare(strict_types=1);

namespace Ocode\Headora\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;

/**
 * Headora style presets; must match HEADORA_PRESET values accepted by @headora/core.
 */
class Preset implements OptionSourceInterface
{
    /**
     * @inheritdoc
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => 'minimal', 'label' => __('Minimal')],
            ['value' => 'bold', 'label' => __('Bold')],
            ['value' => 'classic', 'label' => __('Classic')],
        ];
    }
}
