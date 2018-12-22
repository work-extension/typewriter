package typewriter

import (
	"encoding/json"
	"github.com/segmentio/analytics-go"
	"time"
)

type OrderCompleted struct {
	Affiliation *string   `json:"affiliation,omitempty"` // Store or affiliation from which this transaction occurred (e.g. Google Store)
	CheckoutID  *string   `json:"checkout_id,omitempty"` // Checkout ID
	Coupon      *string   `json:"coupon,omitempty"`      // Transaction coupon redeemed with the transaction
	Currency    *string   `json:"currency,omitempty"`    // Currency code associated with the transaction
	Discount    *float64  `json:"discount,omitempty"`    // Total discount associated with the transaction
	OrderID     string    `json:"order_id"`              // Order/transaction ID
	Products    []Product `json:"products"`              // Products in the order
	Revenue     *float64  `json:"revenue,omitempty"`     // Revenue associated with the transaction (excluding shipping and tax)
	Shipping    *float64  `json:"shipping,omitempty"`    // Shipping cost associated with the transaction
	Tax         *float64  `json:"tax,omitempty"`         // Total tax associated with the transaction
	Total       *float64  `json:"total,omitempty"`       // Revenue with discounts and coupons added in. Note that our Google Analytics Ecommerce; destination accepts total or revenue, but not both. For better flexibility and total; control over tracking, we let you decide how to calculate how coupons and discounts are; applied
}

type Product struct {
	Brand     *string  `json:"brand,omitempty"`      // Brand associated with the product
	Category  *string  `json:"category,omitempty"`   // Product category being viewed
	Coupon    *string  `json:"coupon,omitempty"`     // Coupon code associated with a product (e.g MAY_DEALS_3)
	ImageURL  *string  `json:"image_url,omitempty"`  // Image url of the product
	Name      *string  `json:"name,omitempty"`       // Name of the product being viewed
	Position  *int64   `json:"position,omitempty"`   // Position in the product list (ex. 3)
	Price     *float64 `json:"price,omitempty"`      // Price of the product being viewed
	ProductID *string  `json:"product_id,omitempty"` // Database id of the product being viewed
	Quantity  *float64 `json:"quantity,omitempty"`   // Quantity of a product
	Sku       *string  `json:"sku,omitempty"`        // Sku of the product being viewed
	URL       *string  `json:"url,omitempty"`        // URL of the product page
	Variant   *string  `json:"variant,omitempty"`    // Variant of the product (e.g. Black)
}

type TrackOptions struct {
	MessageId    string                 `json:"messageId,omitempty"`
	AnonymousId  string                 `json:"anonymousId,omitempty"`
	UserId       string                 `json:"userId,omitempty"`
	Timestamp    time.Time              `json:"timestamp,omitempty"`
	Context      *analytics.Context     `json:"context,omitempty"`
	Properties   OrderCompleted         `json:"properties,omitempty"`
	Integrations analytics.Integrations `json:"integrations,omitempty"`
}

type Client struct {
	analytics.Client
}

func New(client analytics.Client) *Client {
	return &Client{client}
}

func toProperties(properties interface{}) (props analytics.Properties, err error) {
	var bytes []byte
	if bytes, err = json.Marshal(properties); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(bytes, &props); err != nil {
		return nil, err
	}

	return
}

func Float(f float64) *float64 {
	return &f
}

func String(s string) *string {
	return &s
}

func (c *Client) OrderCompleted(msg TrackOptions) error {
	props, err := toProperties(msg.Properties)
	if err != nil {
		return err
	}

	return c.Enqueue(analytics.Track{
		Context:      msg.Context,
		UserId:       msg.UserId,
		AnonymousId:  msg.AnonymousId,
		Properties:   props,
		Event:        "Order Completed",
		Integrations: msg.Integrations,
		MessageId:    msg.MessageId,
		Timestamp:    msg.Timestamp,
	})
}