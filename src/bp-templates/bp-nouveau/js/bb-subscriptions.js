/* global wp, bp, BP_Nouveau, _, Backbone */
/* jshint devel: true */
/* @version 3.1.0 */
window.wp = window.wp || {};
window.bp = window.bp || {};

( function( exports, $ ) {

	// Bail if not set.
	if ( typeof BP_Nouveau === 'undefined' ) {
		return;
	}

	_.extend( bp, _.pick( wp, 'Backbone', 'ajax', 'template' ) );

	bp.Models      = bp.Models || {};
	bp.Collections = bp.Collections || {};
	bp.Views       = bp.Views || {};

	bp.Nouveau = bp.Nouveau || {};

	/**
	 * [Nouveau description]
	 *
	 * @type {Object}
	 */
	bp.Nouveau.Subscriptions = {
		/**
		 * [start description]
		 *
		 * @return {[type]} [description]
		 */
		start: function () {
			this.views         = new Backbone.Collection();
			this.subscriptions = [];
			// this.subscription_types = [];
			this.types = [];

			// Listen to events ("Add hooks!").
			this.addListeners();

			this.Initialize();
		},

		/**
		 * [addListeners description]
		 */
		addListeners: function () {
		},

		Initialize: function() {
			this.types            = $( '.subscription-views .bb-accordion' );
			var subscription_list = [];
			var self              = this;

			if ( this.types.length > 0 ) {
				_.each(
					this.types,
					function ( item ) {
						var subscription_type = $( item ).data( 'type' );
						if ( '' !== subscription_type ) {
							this.subscriptions[subscription_type] = new bp.Collections.Subscriptions();

							// Create the loop view.
							subscription_list[subscription_type] = new bp.Views.SubscriptionItems( { collection: this.subscriptions[subscription_type], type: subscription_type } );
							self.views.add( { id: 'subscriptions_' + subscription_type, view: subscription_list[subscription_type] } );

							var current_panel = $( item ).find( '.bb-accordion_panel' ).get( 0 );
							subscription_list[subscription_type].inject( current_panel );
						}
					}
				);
			}
		},
	};

	bp.Models.subscriptionItem = Backbone.Model.extend(
		{
			defaults: {
				id: 0,
				user_id: 0,
				type: '0',
				item_id: 0,
				secondary_item_id: '',
				date_recorded: '',
				_embedded: {},
			}
		}
	);

	bp.Collections.Subscriptions = Backbone.Collection.extend(
		{
			model: bp.Models.subscriptionItem,
			options: {},
			subscription_items: null,
			per_page: BP_Nouveau.subscriptions.per_page,

			initialize : function() {
				this.options = { page: 1, per_page: this.per_page, _embed: true, total_pages: 1 };
			},

			sync: function( method, model, options ) {
				options         = options || {};
				options.context = this;
				options.data    = options.data || {};
				options.path    = 'buddyboss/v1/subscription';
				options.method  = 'GET';

				options.data = _.extend(
					options.data,
					this.options
				);

				bp.apiRequest( options ).done(
					function ( data, status, request ) {
						this.options.total_pages = request.getResponseHeader( 'x-wp-totalpages' );
						this.subscription_items  = data;
					}
				).fail(
					function( error ) {
						this.subscription_items = error;
					}
				);

				return this.subscription_items;
			},

			parse: function( resp ) {
				return resp;
			},

		}
	);

	// Extend wp.Backbone.View with .prepare() and .inject().
	bp.Nouveau.Subscriptions.View = bp.Backbone.View.extend(
		{
			inject: function( selector ) {
				this.render();
				$( selector ).html( this.el );
				this.views.ready();
			},

			prepare: function() {
				if ( ! _.isUndefined( this.model ) && _.isFunction( this.model.toJSON ) ) {
					return this.model.toJSON();
				} else {
					return {};
				}
			}
		}
	);

	bp.Views.SubscriptionItems = bp.Nouveau.Subscriptions.View.extend(
		{
			tagName  : 'div',
			className  : 'subscription-items-main',
			events: {
				'click .subscription-item_remove' : 'removeSubscription',
				'click a.prev': 'gotoPage',
				'click a.page': 'gotoPage',
				'click a.next': 'gotoPage',
			},
			loader : false,
			pagination_params: {
				total_page     : 0,
				current_active : 1,
				left_dots      : false,
				right_dots     : false,
				nav_begin      : 0,
				nav_end        : 0,
			},

			initialize: function() {
				this.loader = new bp.Views.SubscriptionLoading();
				this.views.add( this.loader );

				this.requestSubscriptions();

				var Views = [
					new bp.Nouveau.Subscriptions.View( { tagName: 'ul', id: 'subscription-items', className: 'subscription-items' } )
				];

				_.each(
					Views,
					function( view ) {
						this.views.add( view );
					},
					this
				);

				this.collection.on( 'add', this.addThread, this );
				this.collection.on( 'reset', this.cleanContent, this );
			},

			requestSubscriptions: function( hideLoader ) {
				hideLoader = typeof hideLoader !== 'undefined' ? hideLoader : false;
				hideLoader = ( 'undefined' !== typeof this.collection.hideLoader && false !== this.collection.hideLoader ) ? this.collection.hideLoader : hideLoader;

				if ( hideLoader !== true ) {
					this.collection.reset();
				} else {
					this.collection.models     = [];
					this.collection.length     = 0;
					this.collection.options    = {};
					this.collection._byId      = [];
					this.collection.hideLoader = hideLoader;
				}
				this.collection.fetch(
					{
						data    : _.pick( this.options, ['type', 'page', 'per_page' ] ),
						success : _.bind( this.subscriptionFetched, this ),
						error   : _.bind( this.subscriptionFetchError, this )
					}
				);
			},

			addThread: function( item ) {
				this.views.add( '.subscription-items', new bp.Views.SubscriptionItem( { item: item.attributes } ) );
			},

			cleanContent: function() {
				_.each(
					this.views._views['.subscription-items'],
					function( view ) {
						view.remove();
					}
				);

				$( '#subscription-items' ).html( '' );
			},

			subscriptionFetched: function () {
				if ( this.loader ) {
					this.loader.remove();
				}

				var self = this;

				setTimeout(
					function () {
						if ( self.collection.options.total_pages > 1 ) {
							self.getPaginationParams();
							self.views.add(
								new bp.Views.SubscriptionPager(
									{
										options: self.pagination_params
									}
								),
								{ at: 1 }
							);
						}
					},
					100
				);

			},

			cleanPagination: function() {
				_.each(
					this.views._views,
					function( views ) {
						if ( ! _.isUndefined( views ) ) {
							_.each(
								views,
								function( view ) {
									if ( ! _.isUndefined( view ) && 'subscription-pagination' === view.el.id ) {
										view.remove();
									}
								}
							);
						}
					}
				);
			},

			getPaginationParams: function() {
				var self = this;

				if (self.collection.options.total_pages <= BP_Nouveau.subscriptions.per_page) {
					BP_Nouveau.subscriptions.per_page = self.collection.options.total_pages;
				}

				var range     = Math.floor( BP_Nouveau.subscriptions.per_page / 2 );
				var nav_begin = self.collection.options.page - range;
				if (BP_Nouveau.subscriptions.per_page % 2 === 0) { // If an even number.
					nav_begin++;
				}
				var nav_end    = self.collection.options.page + range;
				var left_dots  = true;
				var right_dots = true;

				if (nav_begin <= 2) {
					nav_end = BP_Nouveau.subscriptions.per_page;
					if (nav_begin === 2) {
						nav_end++;
					}
					nav_begin = 1;
					left_dots = false;
				}

				if (nav_end >= self.collection.options.total_pages - 1 ) {
					nav_begin = self.collection.options.total_pages - BP_Nouveau.subscriptions.per_page + 1;
					if (self.pagination_params === self.collection.options.total_pages - 1) {
						nav_begin--;
					}
					nav_end    = self.collection.options.total_pages;
					right_dots = false;
				}

				var current_active = 1;
				if ( 'undefined' !== typeof self.collection.options.current_active ) {
					current_active = self.collection.options.current_active;
				}

				self.pagination_params = {
					total_page     : parseInt( self.collection.options.total_pages ),
					current_active : parseInt( current_active ),
					left_dots      : left_dots,
					right_dots     : right_dots,
					nav_begin      : parseInt( nav_begin ),
					nav_end        : parseInt( nav_end ),
				}

				return self.pagination_params;
			},

			subscriptionFetchError: function() {
				if ( this.loader ) {
					this.loader.remove();
				}
			},

			removeSubscription: function ( event ) {
				var current = $( event.currentTarget ),
					id      = current.data( 'subscription-id' );

				if ( ! id ) {
					return event;
				}

				event.preventDefault();

				var options    = {};
				options.path   = 'buddyboss/v1/subscription/' + id;
				options.method = 'DELETE';
				options.data   = {};

				var title = current
					.parents( '.bb-subscription-item' )
					.find( '.subscription-item_title' )
					.text();

				current.addClass( 'is_loading' );

				bp.apiRequest( options ).done(
					function( data ) {
						if ( ! _.isUndefined( data.deleted ) ) {
							jQuery( document ).trigger(
								'bb_trigger_toast_message',
								[
									'',
									'<div>' + BP_Nouveau.subscriptions.unsubscribe + '<strong>' + title + '</strong>.</div>',
									'info',
									null,
									true
								]
							);
							current.removeClass( 'is_loading' );
							current.parents( '.bb-subscription-item' ).remove();
						} else {
							current.removeClass( 'is_loading' );
							jQuery( document ).trigger(
								'bb_trigger_toast_message',
								[
									'',
									'<div>' + BP_Nouveau.subscriptions.error + '<strong>' + title + '</strong>.</div>',
									'error',
									null,
									true
								]
							);
						}
					}
				).fail(
					function() {
						jQuery( document ).trigger(
							'bb_trigger_toast_message',
							[
								'',
								'<div>' + BP_Nouveau.subscriptions.error + '<strong>' + title + '</strong>.</div>',
								'error',
								null,
								true
							]
						);
						current.removeClass( 'is_loading' );
					}
				);

			},

			gotoPage: function( event ) {
				var current = $( event.currentTarget ),
					page    = current.data( 'page' );

				if ( ! page ) {
					return event;
				}

				event.preventDefault();
				this.collection.reset();
				this.cleanPagination();
				this.loader = new bp.Views.SubscriptionLoading();
				this.views.add( this.loader );
				this.collection.options.page           = page;
				this.collection.options.current_active = page;
				this.collection.fetch(
					{
						data    : _.pick( this.options, ['type', 'page', 'per_page' ] ),
						success : _.bind( this.subscriptionFetched, this ),
						error   : _.bind( this.subscriptionFetchError, this )
					}
				);

			}
		}
	);

	bp.Views.SubscriptionItem = bp.Nouveau.Subscriptions.View.extend(
		{
			tagName: 'li',
			className: 'bb-subscription-item',
			template  : bp.template( 'bb-subscription-item' ),
			initialize: function() {
				this.model = new Backbone.Model(
					{
						item: this.options.item
					}
				);
			}
		}
	);

	// Loading view.
	bp.Views.SubscriptionLoading = bp.Nouveau.Subscriptions.View.extend(
		{
			tagName: 'div',
			className: '',
			template  : bp.template( 'bb-member-subscription-loading' )
		}
	);

	bp.Views.SubscriptionPager = bp.Nouveau.Subscriptions.View.extend(
		{
			tagName: 'div',
			id: 'subscription-pagination',
			className: 'bbp-pagination subscription-pagination',
			template  : bp.template( 'bb-member-subscription-pagination' ),

			initialize: function() {
				this.model = new Backbone.Model(
					{
						options: this.options
					}
				);
			},
		}
	);

	// Launch BP Nouveau Groups.
	bp.Nouveau.Subscriptions.start();

} )( bp, jQuery );
