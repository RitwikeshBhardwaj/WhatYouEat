export const success = (res, data = {}, status = 200) =>
  res.status(status).json({ success: true, data });

export const paginate = (res, items, page, limit, total) =>
  res.status(200).json({
    success: true,
    data: {
      items,
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      hasMore: (page + 1) * limit < total,
    },
  });
