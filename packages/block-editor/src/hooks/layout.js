/**
 * External dependencies
 */
import classnames from 'classnames';
import { has } from 'lodash';

/**
 * WordPress dependencies
 */
import { Platform } from '@wordpress/element';
import { createHigherOrderComponent, useInstanceId } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { hasBlockSupport } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import {
	PanelBody,
	__experimentalUnitControl as UnitControl,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../store';
import { InspectorControls } from '../components';
import useEditorFeature from '../components/use-editor-feature';
import { LayoutStyle } from '../components/block-list/layout';

const isWeb = Platform.OS === 'web';
const CSS_UNITS = [
	{
		value: '%',
		label: isWeb ? '%' : __( 'Percentage (%)' ),
		default: '',
	},
	{
		value: 'px',
		label: isWeb ? 'px' : __( 'Pixels (px)' ),
		default: '',
	},
	{
		value: 'em',
		label: isWeb ? 'em' : __( 'Relative to parent font size (em)' ),
		default: '',
	},
	{
		value: 'rem',
		label: isWeb ? 'rem' : __( 'Relative to root font size (rem)' ),
		default: '',
	},
	{
		value: 'vw',
		label: isWeb ? 'vw' : __( 'Viewport width (vw)' ),
		default: '',
	},
];

function LayoutPanel( { setAttributes, attributes } ) {
	const { layout = {} } = attributes;
	const { wideSize, contentSize } = layout;
	const defaultLayout = useEditorFeature( 'layout' );
	const themeSupportsLayout = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return getSettings().supportsLayout;
	}, [] );

	if ( ! themeSupportsLayout ) {
		return null;
	}
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Alignments' ) }>
				{ !! defaultLayout && (
					<Button
						isSecondary
						onClick={ () => {
							setAttributes( {
								layout: {
									...defaultLayout,
								},
							} );
						} }
					>
						{ __( 'Inherit default values' ) }
					</Button>
				) }
				<UnitControl
					label={ __( 'Content' ) }
					labelPosition="edge"
					__unstableInputWidth="80px"
					value={ contentSize || wideSize || '' }
					onChange={ ( nextWidth ) => {
						nextWidth =
							0 > parseFloat( nextWidth ) ? '0' : nextWidth;
						setAttributes( {
							layout: {
								...layout,
								contentSize: nextWidth,
							},
						} );
					} }
					units={ CSS_UNITS }
				/>
				<UnitControl
					label={ __( 'Wide' ) }
					labelPosition="edge"
					__unstableInputWidth="80px"
					value={ wideSize || contentSize || '' }
					onChange={ ( nextWidth ) => {
						nextWidth =
							0 > parseFloat( nextWidth ) ? '0' : nextWidth;
						setAttributes( {
							layout: {
								...layout,
								wideSize: nextWidth,
							},
						} );
					} }
					units={ CSS_UNITS }
				/>
				<p>
					{ __(
						'The content and wide sizes determine the behavior of block alignments.'
					) }
				</p>
			</PanelBody>
		</InspectorControls>
	);
}

/**
 * Filters registered block settings, extending attributes to include `layout`.
 *
 * @param  {Object} settings Original block settings
 * @return {Object}          Filtered block settings
 */
export function addAttribute( settings ) {
	if ( has( settings.attributes, [ 'layout', 'type' ] ) ) {
		return settings;
	}
	if ( hasBlockSupport( settings, '__experimentalLayout' ) ) {
		settings.attributes = {
			...settings.attributes,
			layout: {
				type: 'object',
			},
		};
	}

	return settings;
}

/**
 * Override the default edit UI to include layout controls
 *
 * @param  {Function} BlockEdit Original component
 * @return {Function}           Wrapped component
 */
export const withInspectorControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name: blockName } = props;
		const supportLayout = hasBlockSupport(
			blockName,
			'__experimentalLayout'
		);

		return [
			supportLayout && <LayoutPanel key="layout" { ...props } />,
			<BlockEdit key="edit" { ...props } />,
		];
	},
	'withInspectorControls'
);

/**
 * Override the default block element to add the layout styles.
 *
 * @param  {Function} BlockListBlock Original component
 * @return {Function}                Wrapped component
 */
export const withLayoutStyles = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const { name, attributes } = props;
		const supportLayout = hasBlockSupport( name, '__experimentalLayout' );
		const id = useInstanceId( BlockListBlock );
		if ( ! supportLayout === undefined ) {
			return <BlockListBlock { ...props } />;
		}
		const { layout = {} } = attributes;
		const { wideSize, contentSize } = layout;
		if ( ! wideSize && ! contentSize ) {
			return <BlockListBlock { ...props } />;
		}

		const className = classnames(
			props?.className,
			`wp-container-${ id }`
		);

		return (
			<>
				<LayoutStyle
					selector={ `.wp-container-${ id }` }
					layout={ layout }
				/>
				<BlockListBlock { ...props } className={ className } />
			</>
		);
	}
);

addFilter(
	'blocks.registerBlockType',
	'core/layout/addAttribute',
	addAttribute
);
addFilter(
	'editor.BlockListBlock',
	'core/editor/layout/with-layout-styles',
	withLayoutStyles
);
addFilter(
	'editor.BlockEdit',
	'core/editor/layout/with-inspector-controls',
	withInspectorControls
);
