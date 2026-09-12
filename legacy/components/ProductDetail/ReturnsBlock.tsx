import Link from "next/link";
import styles from "../../styles/ProductDetail.module.css";
import { useEffect, useState } from "react";

function ReturnsBlock({ PDPReturnCMSBlock, ReturnPolicy }: any) {
  const PDPReturnCMSBlockData = PDPReturnCMSBlock ? PDPReturnCMSBlock : {
    "data": {
      "cmsBlocks": {
        "items": [
          {
            "identifier": "pdp-return-policy",
            "title": "PDP Return Policy",
            "content": "<div class=\"pdp-return-policy\">\r\n<div id=\"8242\" class=\"FINAL-SALE\">\r\n<h3>FINAL SALE:</h3>\r\n<p>THIS ITEM IS FINAL SALE AND NOT RETURNABLE.</p>\r\n</div>\r\n<div id=\"8243\" class=\"7-Day-Return\">\r\n<h3>7-Day Return</h3>\r\n<p>We are pleased to accept the return and refund of this item within 7 business days of you receiving it, for any reason. Items must be returned back in the same exact condition that they were received including but not limited to all tags, stickers, box and papers. Upon receipt, should we find that the security tag has been tampered with or removed, or the sticker noting non-returnable has been removed, we will not be able to accept the return.</p>\r\n</div>\r\n<div id=\"0\" class=\"7-Day-Return\">\r\n<h3>7-Day Return</h3>\r\n<p>We are pleased to accept the return and refund of this item within 7 business days of you receiving it, for any reason. Items must be returned back in the same exact condition that they were received including but not limited to all tags, stickers, box and papers. Upon receipt, should we find that the security tag has been tampered with or removed, or the sticker noting non-returnable has been removed, we will not be able to accept the return.</p>\r\n</div>\r\n<div id=\"8244\" class=\"Special Holiday-Credit\">\r\n<h3>Special Holiday Credit</h3>\r\n<p>You can exchange or receive Headora store credit for purchases made from Nov. 7 to Dec. 23, 2018. Requests for exchange or Headora store credit must be made by Jan. 11, 2019.<br>Items must be sent back in the same exact condition that they were received including but not limited to all tags, stickers, box and papers. Upon receipt, should we find that the security tag has been tampered with or removed, or the sticker noting non-returnable has been removed, we will not be able to accept.</p>\r\n</div>\r\n<div id=\"8245\" class=\"Extended-Holiday-Returns\">\r\n<h3>Extended Holiday Returns</h3>\r\n<p>You can exchange or receive Headora store credit for purchases made from Nov. 7 to Dec. 23, 2018. Requests for exchange or Headora store credit must be made by Jan. 11, 2019. You can also return this item back for a full refund within 7 business days of you receiving it.<br>Items must be sent back in the same exact condition that they were received including but not limited to all tags, stickers, box and papers. Upon receipt, should we find that the security tag has been tampered with or removed, or the sticker noting non-returnable has been removed, we will not be able to accept.</p>\r\n</div>\r\n</div>"
          }
        ]
      }
    }
  }
  const [filteredHtml, setFilteredHtml] = useState<string>("");
  
  useEffect(() => {
    setTimeout(() => {
    const sanitizedHtml = PDPReturnCMSBlockData?.cmsBlocks?.items?.[0]?.content;

    if (sanitizedHtml && ReturnPolicy) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitizedHtml, "text/html");
      const targetDiv = doc.getElementById(ReturnPolicy);

      if (targetDiv) {
        setFilteredHtml(targetDiv.outerHTML);
      } else {
        setFilteredHtml(""); // Fallback if no match
      }
    }
      }, 2000);
  }, [PDPReturnCMSBlockData, ReturnPolicy]);

  return (
    <>
      {/* {filteredHtml && ( */}
        <div className={styles.returnDescribtionConatiner}>
        <div id="returns" className="tabcontent" >
                                    <div className="returns-title">7-Day Return</div>
                                    <div className="returns-text">We are pleased to accept the return and refund of this item within 7 business days of you receiving it, for any reason. Items must be returned back in the same exact condition that they were received including but not limited to all tags, stickers, box and papers.&nbsp; Upon receipt, should we find that the security tag has been tampered with or removed, or the sticker noting non-returnable has been removed, we will not be able to accept the return.</div>
          {/* <div dangerouslySetInnerHTML={{ __html: filteredHtml }} /> */}
          <span>
            <Link href={"/returns"}>VIEW RETURN POLICY</Link>
          </span>
          </div>
        </div>
      {/* )} */}
    </>
  );
}

export default ReturnsBlock;