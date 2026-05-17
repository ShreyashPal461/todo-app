'use strict';

/**
 * todo controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::todo.todo', ({ strapi }) => ({
  // 1. Find only the logged-in user's todos
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your todos.');
    }

    // Force filtering by the logged-in user's ID
    ctx.query.filters = ctx.query.filters || {};
    ctx.query.filters.user = {
      id: {
        $eq: user.id,
      },
    };

    // Call the core find action with the modified query
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  // 2. Find a single todo and ensure it belongs to the logged-in user
  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const { id } = ctx.params;
    
    // In Strapi v5, we look up by documentId
    const todo = await strapi.documents('api::todo.todo').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!todo) {
      return ctx.notFound('Todo not found.');
    }

    // Verify ownership
    if (!todo.user || todo.user.id !== user.id) {
      return ctx.unauthorized('You do not have permission to access this todo.');
    }

    const response = await super.findOne(ctx);
    return response;
  },

  // 3. Create a todo and automatically bind it to the logged-in user
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a todo.');
    }

    // Ensure ctx.request.body.data exists
    ctx.request.body.data = ctx.request.body.data || {};
    
    // Automatically set the user relation on the backend (Strict Backend Policy)
    ctx.request.body.data.user = user.id;

    // Call default create action
    const response = await super.create(ctx);
    return response;
  },

  // 4. Update a todo and ensure ownership
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const { id } = ctx.params;

    // Fetch the todo to check owner
    const todo = await strapi.documents('api::todo.todo').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!todo) {
      return ctx.notFound('Todo not found.');
    }

    if (!todo.user || todo.user.id !== user.id) {
      return ctx.unauthorized('You do not have permission to update this todo.');
    }

    // Strip out any attempts to change the user relation from the body
    if (ctx.request.body.data) {
      delete ctx.request.body.data.user;
    }

    const response = await super.update(ctx);
    return response;
  },

  // 5. Delete a todo and ensure ownership
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const { id } = ctx.params;

    // Fetch the todo to check owner
    const todo = await strapi.documents('api::todo.todo').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!todo) {
      return ctx.notFound('Todo not found.');
    }

    if (!todo.user || todo.user.id !== user.id) {
      return ctx.unauthorized('You do not have permission to delete this todo.');
    }

    const response = await super.delete(ctx);
    return response;
  }
}));
