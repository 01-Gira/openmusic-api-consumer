const { Pool } = require('pg');

class PlaylistsService{
  constructor() {
    this._pool = new Pool();
  }

  async getSongsFromPlaylist(playlistId, userId) {
    const query = {
      text: `SELECT p.id, p.name,
              COALESCE(
                  json_agg(
                      json_build_object(
                          'id', s.id,
                          'title', s.title,
                          'performer', s.performer
                      )
                  ) FILTER (WHERE ps.id IS NOT NULL), '[]'
              ) AS songs
        FROM playlists p 
        LEFT JOIN playlist_songs ps ON p.id = ps."playlistId"
        LEFT JOIN songs s ON ps."songId" = s.id 
        JOIN users u ON p."userId" = u.id
        WHERE p.id = $1 AND p."userId" = $2
        GROUP BY p.id, u.username`,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    return {
      playlist : result.rows[0]
    };
  }
}

module.exports = PlaylistsService;