#include <stdint.h>
#include <random>
#define POW2(x) ((x) * (x))

struct point {
  uint32_t x;
  uint32_t y;
  uint32_t id;
};

struct sum {
  uint32_t total;
  uint32_t x;
  uint32_t y;
};

extern "C" {
  point* do_centroids(uint32_t* buffer, uint32_t size, uint32_t clusters_count, uint32_t space_size);
};

uint32_t calculate_distance(uint32_t x1, uint32_t y1, uint32_t x2, uint32_t y2) {
  return POW2(x2 - x1) + POW2(y2 - y1);
}

double crandom() {
  static std::mt19937 rd(std::random_device{}());
  static std::uniform_real_distribution<double> dist(0, 1);

  return static_cast<double>(dist(rd));
}

uint32_t random_range(uint32_t min, uint32_t max) {
  return crandom() * (max - min) + min;
}

void assign_to_clusters(
  point* points, 
  uint32_t points_size, 
  point* cluster_owners, 
  uint32_t cluster_owners_size
) {
  for (uint32_t i = 0; i < points_size; i++) {
    uint32_t distance = 0xFFFFFFFF - 1;

    for (uint32_t j = 0; j < cluster_owners_size; j++) {
      point c = cluster_owners[j];
      uint32_t new_distance = calculate_distance(points[i].x, points[i].y, c.x, c.y);

      if (new_distance < distance) {
        distance = new_distance;
        points[i].id = c.id;
      }
    }
  }
}

point* do_centroids(
  uint32_t* points_buffer, 
  uint32_t points_buffer_size, 
  uint32_t clusters_count, 
  uint32_t space_size
) {
  uint32_t points_count = points_buffer_size / 3;

  point* points = new point[points_count];
  point* clusters = new point[clusters_count];
  sum* sums = new sum[clusters_count];

  for (uint32_t i = 0, j = 0; i < points_buffer_size; i++, j += 3) {
    points[i].x = points_buffer[j];
    points[i].y = points_buffer[j + 1];
    points[i].id = points_buffer[j + 2];
  }

  for (uint32_t i = 0; i < clusters_count; i++) {
    clusters[i].x = random_range(0, space_size);
    clusters[i].y = random_range(0, space_size);
    clusters[i].id = i;
  }

  for (uint8_t i = 0; i < 20; i++) {
    assign_to_clusters(points, points_count, clusters, clusters_count);

    for (uint32_t j = 0; j < clusters_count; j++) {
      sums[j].x = 0;
      sums[j].y = 0;
      sums[j].total = 1;
    }

    for (uint32_t j = 0; j < points_count; j++) {
      point p = points[j];
      sums[p.id].total++;
      sums[p.id].x += p.x;
      sums[p.id].y += p.y;
    }

    for (uint32_t j = 0; j < clusters_count; j++) {
      point c = clusters[j];
      clusters[j].x = sums[c.id].x / sums[c.id].total;
      clusters[j].y = sums[c.id].y / sums[c.id].total;
    }
  }

  delete[] points;
  delete[] clusters;
  delete[] sums;

  return points;
}