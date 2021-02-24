/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	BlockContextProvider,
	BlockPreview,
	useBlockProps,
	__experimentalUseInnerBlocksProps as useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { useQueryContext } from '../query';

const TEMPLATE = [
	[ 'core/post-title' ],
	[ 'core/post-date' ],
	[ 'core/post-excerpt' ],
];
export default function QueryLoopEdit( {
	clientId,
	attributes: { align },
	context: {
		query: {
			perPage,
			offset,
			categoryIds,
			postType,
			tagIds = [],
			order,
			orderBy,
			author,
			search,
			exclude,
			sticky,
			inherit,
		} = {},
		queryContext = [ {} ],
		templateSlug,
		// `layout` and `align` context come from `Query` block
		// and is a UI choice to make the handling of the block more
		// user friendly. The plan is to find a way to make these two
		// attributes of `QueryLoop`, but keep them in `Query` toolbar
		// and later absorb the `QueryLoop` toolbar from its parent.
		layout: { type: layoutType = 'flex', columns = 1 } = {},
	},
} ) {
	const [ { page } ] = useQueryContext() || queryContext;
	const [ activeBlockContext, setActiveBlockContext ] = useState();

	const { posts, blocks } = useSelect(
		( select ) => {
			const { getEntityRecords } = select( coreStore );
			const { getBlocks } = select( blockEditorStore );
			const query = {
				offset: perPage ? perPage * ( page - 1 ) + offset : 0,
				categories: categoryIds,
				tags: tagIds,
				order,
				orderby: orderBy,
			};
			if ( perPage ) {
				query.per_page = perPage;
			}
			if ( author ) {
				query.author = author;
			}
			if ( search ) {
				query.search = search;
			}
			if ( exclude?.length ) {
				query.exclude = exclude;
			}
			// If sticky is not set, it will return all posts in the results.
			// If sticky is set to `only`, it will limit the results to sticky posts only.
			// If it is anything else, it will exclude sticky posts from results. For the record the value stored is `exclude`.
			if ( sticky ) {
				query.sticky = sticky === 'only';
			}
			// If `inherit` is truthy, adjust conditionally the query to create a better preview.
			if ( inherit ) {
				// Change the post-type if needed.
				if ( templateSlug?.startsWith( 'archive-' ) ) {
					query.postType = templateSlug.replace( 'archive-', '' );
					postType = query.postType;
				}
			}
			return {
				posts: getEntityRecords( 'postType', postType, query ),
				blocks: getBlocks( clientId ),
			};
		},
		[
			perPage,
			page,
			offset,
			categoryIds,
			tagIds,
			order,
			orderBy,
			clientId,
			author,
			search,
			postType,
			exclude,
			sticky,
			inherit,
			templateSlug,
		]
	);

	const blockContexts = useMemo(
		() =>
			posts?.map( ( post ) => ( {
				postType: post.type,
				postId: post.id,
			} ) ),
		[ posts ]
	);
	const hasLayoutFlex = layoutType === 'flex' && columns > 1;
	const extraBlockProps = {
		className: classnames( {
			'is-flex-container': hasLayoutFlex,
			[ `columns-${ columns }` ]: hasLayoutFlex,
		} ),
	};
	// We haven't used the `supports.align` here because first we
	// need to find a way to absorb toolbars for nested block
	// wrappers (https://github.com/WordPress/gutenberg/issues/7694).
	if ( align ) extraBlockProps[ 'data-align' ] = align;
	const blockProps = useBlockProps( extraBlockProps );
	const innerBlocksProps = useInnerBlocksProps( {}, { template: TEMPLATE } );

	if ( ! posts ) {
		return <p { ...blockProps }>{ __( 'Loading…' ) }</p>;
	}

	if ( ! posts.length ) {
		return <p { ...blockProps }> { __( 'No results found.' ) }</p>;
	}

	return (
		<ul { ...blockProps }>
			{ blockContexts &&
				blockContexts.map( ( blockContext ) => (
					<BlockContextProvider
						key={ blockContext.postId }
						value={ blockContext }
					>
						{ blockContext ===
						( activeBlockContext || blockContexts[ 0 ] ) ? (
							<li { ...innerBlocksProps } />
						) : (
							<li>
								<BlockPreview
									blocks={ blocks }
									__experimentalLive
									__experimentalOnClick={ () =>
										setActiveBlockContext( blockContext )
									}
								/>
							</li>
						) }
					</BlockContextProvider>
				) ) }
		</ul>
	);
}
